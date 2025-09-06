"""
Physics Body Module
Contains the core PhysicsBody class that represents objects in the physics simulation
"""

import math
from typing import List, Optional, Tuple
from vector2d import Vector2D


class PhysicsBody:
    """
    Core physics body class representing objects in the physics simulation
    """
    
    def __init__(self, 
                 position: Vector2D = None,
                 velocity: Vector2D = None,
                 mass: float = 1.0,
                 radius: float = 10.0,
                 restitution: float = 0.8,
                 friction: float = 0.3,
                 is_static: bool = False,
                 body_type: str = "circle"):
        """
        Initialize a physics body
        
        Args:
            position: Initial position
            velocity: Initial velocity
            mass: Mass of the body
            radius: Radius for circular bodies
            restitution: Bounce factor (0-1)
            friction: Friction coefficient
            is_static: Whether body is affected by physics
            body_type: Shape type (circle, polygon, etc.)
        """
        self.position = position if position else Vector2D.zero()
        self.velocity = velocity if velocity else Vector2D.zero()
        self.acceleration = Vector2D.zero()
        self.force = Vector2D.zero()
        
        self.mass = max(0.001, mass)  # Prevent zero mass
        self.inv_mass = 1.0 / self.mass if not is_static else 0.0
        self.radius = radius
        self.restitution = restitution
        self.friction = friction
        self.is_static = is_static
        self.body_type = body_type
        
        # Additional properties
        self.angular_velocity = 0.0
        self.angular_acceleration = 0.0
        self.torque = 0.0
        self.angle = 0.0
        self.moment_of_inertia = 0.5 * mass * radius * radius  # For circles
        self.inv_inertia = 1.0 / self.moment_of_inertia if not is_static and self.moment_of_inertia > 0 else 0.0
        
        # Material properties
        self.density = 1.0
        self.viscosity_coefficient = 0.1
        self.buoyancy = 0.0
        
        # Visual properties
        self.color = (255, 255, 255)
        self.trail_points = []
        self.max_trail_length = 50
        
        # Collision properties
        self.collision_mask = 1
        self.collision_layer = 1
        self.vertices = []  # For polygon bodies
        self.local_vertices = []  # Original vertices in local space
        
        # State tracking
        self.sleeping = False
        self.sleep_threshold = 0.01
        self.awake_time = 0.0
        
        # Debug info
        self.collision_count = 0
        self.last_collision_time = 0.0
    
    def apply_force(self, force: Vector2D, point: Vector2D = None) -> None:
        """
        Apply a force to the body
        
        Args:
            force: Force vector to apply
            point: Point of application (for torque calculation)
        """
        if self.is_static:
            return
            
        self.force += force
        
        # Apply torque if point is specified
        if point:
            r = point - self.position
            self.torque += r.cross(force)
    
    def apply_impulse(self, impulse: Vector2D, point: Vector2D = None) -> None:
        """
        Apply an impulse (instant force) to the body
        
        Args:
            impulse: Impulse vector to apply
            point: Point of application
        """
        if self.is_static:
            return
            
        self.velocity += impulse * self.inv_mass
        
        if point:
            r = point - self.position
            self.angular_velocity += r.cross(impulse) * self.inv_inertia
    
    def clear_forces(self) -> None:
        """Clear all accumulated forces and torques"""
        self.force = Vector2D.zero()
        self.torque = 0.0
    
    def integrate_forces(self, dt: float) -> None:
        """
        Integrate forces to update acceleration
        
        Args:
            dt: Time step
        """
        if self.is_static:
            return
            
        self.acceleration = self.force * self.inv_mass
        self.angular_acceleration = self.torque * self.inv_inertia
    
    def integrate_velocity(self, dt: float) -> None:
        """
        Integrate velocity to update position
        
        Args:
            dt: Time step
        """
        if self.is_static:
            return
            
        # Update linear motion
        self.velocity += self.acceleration * dt
        self.position += self.velocity * dt
        
        # Update angular motion
        self.angular_velocity += self.angular_acceleration * dt
        self.angle += self.angular_velocity * dt
        
        # Apply damping
        damping = 0.999
        self.velocity *= damping
        self.angular_velocity *= damping
        
        # Update trail
        self.update_trail()
        
        # Check for sleep
        self.update_sleep_state(dt)
    
    def update_trail(self) -> None:
        """Update the trail points for visual effects"""
        self.trail_points.append(self.position.copy())
        if len(self.trail_points) > self.max_trail_length:
            self.trail_points.pop(0)
    
    def update_sleep_state(self, dt: float) -> None:
        """Update sleep state based on movement"""
        kinetic_energy = 0.5 * self.mass * self.velocity.magnitude_squared
        rotational_energy = 0.5 * self.moment_of_inertia * self.angular_velocity * self.angular_velocity
        
        if kinetic_energy + rotational_energy < self.sleep_threshold:
            self.awake_time += dt
            if self.awake_time > 1.0:  # Sleep after 1 second of low energy
                self.sleeping = True
        else:
            self.awake_time = 0.0
            self.sleeping = False
    
    def wake_up(self) -> None:
        """Wake up the body"""
        self.sleeping = False
        self.awake_time = 0.0
    
    def set_polygon_vertices(self, vertices: List[Vector2D]) -> None:
        """
        Set vertices for polygon bodies
        
        Args:
            vertices: List of vertices in local coordinates
        """
        self.local_vertices = vertices.copy()
        self.body_type = "polygon"
        self.update_polygon_vertices()
        self.calculate_polygon_properties()
    
    def update_polygon_vertices(self) -> None:
        """Update world space vertices from local vertices"""
        self.vertices = []
        cos_a = math.cos(self.angle)
        sin_a = math.sin(self.angle)
        
        for vertex in self.local_vertices:
            # Rotate and translate vertex
            rotated_x = vertex.x * cos_a - vertex.y * sin_a
            rotated_y = vertex.x * sin_a + vertex.y * cos_a
            world_vertex = Vector2D(rotated_x, rotated_y) + self.position
            self.vertices.append(world_vertex)
    
    def calculate_polygon_properties(self) -> None:
        """Calculate mass properties for polygon"""
        if len(self.local_vertices) < 3:
            return
            
        area = 0.0
        centroid = Vector2D.zero()
        inertia = 0.0
        
        for i in range(len(self.local_vertices)):
            j = (i + 1) % len(self.local_vertices)
            v1 = self.local_vertices[i]
            v2 = self.local_vertices[j]
            
            cross = v1.cross(v2)
            area += cross
            centroid += (v1 + v2) * cross
            
            # Calculate moment of inertia
            inertia += cross * (v1.dot(v1) + v1.dot(v2) + v2.dot(v2))
        
        area *= 0.5
        if area > 0:
            centroid *= 1.0 / (6.0 * area)
            inertia = abs(inertia) / 12.0
            
            self.moment_of_inertia = self.mass * inertia / area if area > 0 else 0.0
            self.inv_inertia = 1.0 / self.moment_of_inertia if self.moment_of_inertia > 0 and not self.is_static else 0.0
    
    def get_aabb(self) -> Tuple[Vector2D, Vector2D]:
        """
        Get axis-aligned bounding box
        
        Returns:
            Tuple of (min_point, max_point)
        """
        if self.body_type == "circle":
            min_point = self.position - Vector2D(self.radius, self.radius)
            max_point = self.position + Vector2D(self.radius, self.radius)
            return (min_point, max_point)
        elif self.body_type == "polygon" and self.vertices:
            min_x = min(v.x for v in self.vertices)
            max_x = max(v.x for v in self.vertices)
            min_y = min(v.y for v in self.vertices)
            max_y = max(v.y for v in self.vertices)
            return (Vector2D(min_x, min_y), Vector2D(max_x, max_y))
        else:
            return (self.position.copy(), self.position.copy())
    
    def contains_point(self, point: Vector2D) -> bool:
        """
        Check if a point is inside the body
        
        Args:
            point: Point to test
            
        Returns:
            True if point is inside the body
        """
        if self.body_type == "circle":
            return self.position.distance_to(point) <= self.radius
        elif self.body_type == "polygon" and len(self.vertices) >= 3:
            # Use ray casting algorithm
            count = 0
            j = len(self.vertices) - 1
            
            for i in range(len(self.vertices)):
                v1 = self.vertices[j]
                v2 = self.vertices[i]
                
                if ((v1.y > point.y) != (v2.y > point.y)) and \
                   (point.x < (v2.x - v1.x) * (point.y - v1.y) / (v2.y - v1.y) + v1.x):
                    count += 1
                j = i
            
            return count % 2 == 1
        
        return False
    
    def get_kinetic_energy(self) -> float:
        """Get total kinetic energy of the body"""
        linear_ke = 0.5 * self.mass * self.velocity.magnitude_squared
        angular_ke = 0.5 * self.moment_of_inertia * self.angular_velocity * self.angular_velocity
        return linear_ke + angular_ke
    
    def get_potential_energy(self, gravity: Vector2D) -> float:
        """Get gravitational potential energy"""
        return self.mass * abs(gravity.magnitude) * abs(self.position.y)
    
    def __repr__(self) -> str:
        return f"PhysicsBody(pos={self.position}, vel={self.velocity}, mass={self.mass})"

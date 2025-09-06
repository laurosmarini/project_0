"""
Specialized Physics Systems
Implements orbital mechanics, vehicle physics with suspension, and projectile motion with air resistance
"""

import math
import random
from typing import List, Dict, Tuple, Optional
from vector2d import Vector2D, clamp
from physics_body import PhysicsBody


class OrbitingBody:
    """
    Body with orbital mechanics calculations
    """
    
    def __init__(self, position: Vector2D, velocity: Vector2D, mass: float, 
                 radius: float = 10.0, is_central_body: bool = False):
        self.position = position.copy()
        self.velocity = velocity.copy()
        self.mass = mass
        self.radius = radius
        self.is_central_body = is_central_body
        
        # Orbital parameters
        self.gravitational_parameter = 0.0  # Will be set by orbital system
        self.orbital_energy = 0.0
        self.angular_momentum = 0.0
        self.eccentricity = 0.0
        self.semi_major_axis = 0.0
        self.periapsis = 0.0
        self.apoapsis = 0.0
        
        # Forces
        self.gravitational_force = Vector2D.zero()
        self.total_force = Vector2D.zero()
        
        # Visual properties
        self.color = (255, 255, 255)
        self.trail_points = []
        self.max_trail_length = 200
        
        # Orbital path visualization
        self.orbit_points = []
        self.show_orbit = True
    
    def update_orbital_parameters(self, central_mass: float, central_position: Vector2D) -> None:
        """Update orbital parameters based on current state"""
        r_vector = self.position - central_position
        r_magnitude = r_vector.magnitude
        
        if r_magnitude == 0:
            return
        
        # Gravitational parameter (μ = GM)
        G = 6.674e-11 * 1e15  # Scaled for pixel coordinates
        mu = G * central_mass
        
        # Specific orbital energy
        kinetic_energy = 0.5 * self.velocity.magnitude_squared
        potential_energy = -mu / r_magnitude
        self.orbital_energy = kinetic_energy + potential_energy
        
        # Specific angular momentum
        self.angular_momentum = r_vector.cross(self.velocity)
        
        # Semi-major axis
        if self.orbital_energy < 0:  # Elliptical orbit
            self.semi_major_axis = -mu / (2 * self.orbital_energy)
            
            # Eccentricity
            h_squared = self.angular_momentum * self.angular_momentum
            e_vector_mag_sq = 1 + (2 * self.orbital_energy * h_squared) / (mu * mu)
            self.eccentricity = math.sqrt(max(0, e_vector_mag_sq))
            
            # Periapsis and apoapsis
            self.periapsis = self.semi_major_axis * (1 - self.eccentricity)
            self.apoapsis = self.semi_major_axis * (1 + self.eccentricity)
        else:  # Parabolic or hyperbolic
            self.semi_major_axis = float('inf')
            self.eccentricity = 1.0 if self.orbital_energy == 0 else math.sqrt(1 + (2 * self.orbital_energy * self.angular_momentum * self.angular_momentum) / (mu * mu))
            self.periapsis = (self.angular_momentum * self.angular_momentum) / mu
            self.apoapsis = float('inf')
    
    def update_trail(self) -> None:
        """Update orbital trail"""
        self.trail_points.append(self.position.copy())
        if len(self.trail_points) > self.max_trail_length:
            self.trail_points.pop(0)


class OrbitalMechanicsSystem:
    """
    N-body orbital mechanics simulation
    """
    
    def __init__(self, gravitational_constant: float = 6.674e-11 * 1e15):
        self.bodies = []
        self.gravitational_constant = gravitational_constant
        self.time_scale = 1.0
        self.show_force_vectors = False
        self.show_velocity_vectors = False
        
        # Simulation bounds
        self.bounds = None
        
    def add_body(self, body: OrbitingBody) -> None:
        """Add a body to the system"""
        self.bodies.append(body)
    
    def remove_body(self, body: OrbitingBody) -> None:
        """Remove a body from the system"""
        if body in self.bodies:
            self.bodies.remove(body)
    
    def update(self, dt: float) -> None:
        """Update orbital mechanics simulation"""
        dt *= self.time_scale
        
        # Clear forces
        for body in self.bodies:
            body.gravitational_force = Vector2D.zero()
            body.total_force = Vector2D.zero()
        
        # Calculate gravitational forces between all body pairs
        for i, body1 in enumerate(self.bodies):
            for j, body2 in enumerate(self.bodies[i+1:], i+1):
                self.calculate_gravitational_force(body1, body2)
        
        # Update positions and velocities
        for body in self.bodies:
            if not body.is_central_body:
                self.integrate_body(body, dt)
        
        # Update orbital parameters
        central_bodies = [b for b in self.bodies if b.is_central_body]
        if central_bodies:
            central_body = central_bodies[0]  # Use first central body
            for body in self.bodies:
                if not body.is_central_body:
                    body.update_orbital_parameters(central_body.mass, central_body.position)
        
        # Update trails
        for body in self.bodies:
            body.update_trail()
    
    def calculate_gravitational_force(self, body1: OrbitingBody, body2: OrbitingBody) -> None:
        """Calculate gravitational force between two bodies"""
        r_vector = body2.position - body1.position
        r_magnitude = r_vector.magnitude
        
        if r_magnitude == 0:
            return
        
        # Newton's law of universal gravitation: F = G * m1 * m2 / r^2
        force_magnitude = self.gravitational_constant * body1.mass * body2.mass / (r_magnitude * r_magnitude)
        force_direction = r_vector.normalize()
        force = force_direction * force_magnitude
        
        # Apply equal and opposite forces
        body1.gravitational_force += force
        body1.total_force += force
        
        body2.gravitational_force -= force
        body2.total_force -= force
    
    def integrate_body(self, body: OrbitingBody, dt: float) -> None:
        """Integrate body motion using Verlet integration"""
        acceleration = body.total_force / body.mass
        
        # Update velocity and position
        body.velocity += acceleration * dt
        body.position += body.velocity * dt
        
        # Apply bounds if set
        if self.bounds:
            min_x, min_y, max_x, max_y = self.bounds
            if (body.position.x < min_x or body.position.x > max_x or
                body.position.y < min_y or body.position.y > max_y):
                # Remove body if it goes out of bounds
                self.remove_body(body)
    
    def create_circular_orbit(self, central_body: OrbitingBody, orbital_distance: float, 
                            orbital_mass: float = 1.0, angle: float = 0.0) -> OrbitingBody:
        """Create a body in circular orbit around a central body"""
        # Calculate orbital velocity for circular orbit
        mu = self.gravitational_constant * central_body.mass
        orbital_velocity = math.sqrt(mu / orbital_distance)
        
        # Position
        position = central_body.position + Vector2D(
            orbital_distance * math.cos(angle),
            orbital_distance * math.sin(angle)
        )
        
        # Velocity (perpendicular to position vector)
        velocity_direction = Vector2D(-math.sin(angle), math.cos(angle))
        velocity = velocity_direction * orbital_velocity
        
        orbiting_body = OrbitingBody(position, velocity, orbital_mass)
        self.add_body(orbiting_body)
        
        return orbiting_body
    
    def create_elliptical_orbit(self, central_body: OrbitingBody, periapsis: float, 
                              apoapsis: float, orbital_mass: float = 1.0, 
                              angle: float = 0.0) -> OrbitingBody:
        """Create a body in elliptical orbit"""
        semi_major_axis = (periapsis + apoapsis) / 2.0
        eccentricity = (apoapsis - periapsis) / (apoapsis + periapsis)
        
        mu = self.gravitational_constant * central_body.mass
        
        # Start at periapsis
        position = central_body.position + Vector2D(
            periapsis * math.cos(angle),
            periapsis * math.sin(angle)
        )
        
        # Velocity at periapsis
        velocity_magnitude = math.sqrt(mu * (2.0 / periapsis - 1.0 / semi_major_axis))
        velocity_direction = Vector2D(-math.sin(angle), math.cos(angle))
        velocity = velocity_direction * velocity_magnitude
        
        orbiting_body = OrbitingBody(position, velocity, orbital_mass)
        self.add_body(orbiting_body)
        
        return orbiting_body


class Projectile:
    """
    Projectile with air resistance and environmental effects
    """
    
    def __init__(self, position: Vector2D, velocity: Vector2D, mass: float = 1.0, 
                 drag_coefficient: float = 0.47, cross_sectional_area: float = 0.01):
        self.position = position.copy()
        self.velocity = velocity.copy()
        self.initial_velocity = velocity.copy()
        self.mass = mass
        self.drag_coefficient = drag_coefficient
        self.cross_sectional_area = cross_sectional_area
        
        # Forces
        self.gravity_force = Vector2D.zero()
        self.drag_force = Vector2D.zero()
        self.wind_force = Vector2D.zero()
        self.total_force = Vector2D.zero()
        
        # Properties
        self.radius = 3.0
        self.color = (255, 200, 100)
        self.trail_points = []
        self.max_trail_length = 100
        
        # Flight data
        self.flight_time = 0.0
        self.max_height = position.y
        self.distance_traveled = 0.0
        self.is_active = True
        
        # Environment interaction
        self.bounce_factor = 0.6
        self.ground_friction = 0.8
        self.has_bounced = False
    
    def apply_forces(self, gravity: Vector2D, air_density: float = 1.225, 
                    wind_velocity: Vector2D = None) -> None:
        """Apply forces to the projectile"""
        # Clear forces
        self.gravity_force = Vector2D.zero()
        self.drag_force = Vector2D.zero()
        self.wind_force = Vector2D.zero()
        
        # Gravity
        self.gravity_force = gravity * self.mass
        
        # Air resistance (drag)
        if self.velocity.magnitude > 0:
            relative_velocity = self.velocity.copy()
            if wind_velocity:
                relative_velocity -= wind_velocity
                self.wind_force = wind_velocity * (air_density * 0.1)  # Simplified wind effect
            
            drag_magnitude = 0.5 * air_density * self.drag_coefficient * self.cross_sectional_area * relative_velocity.magnitude_squared
            drag_direction = -relative_velocity.normalize()
            self.drag_force = drag_direction * drag_magnitude
        
        # Total force
        self.total_force = self.gravity_force + self.drag_force + self.wind_force


class ProjectileSystem:
    """
    System for managing multiple projectiles with environmental effects
    """
    
    def __init__(self, gravity: Vector2D = None, air_density: float = 1.225):
        self.projectiles = []
        self.gravity = gravity if gravity else Vector2D(0, 981)  # 9.81 m/s^2 scaled
        self.air_density = air_density
        self.wind_velocity = Vector2D.zero()
        
        # Environment
        self.ground_level = 550
        self.obstacles = []
        
        # Variable gravity (for different planets/environments)
        self.gravity_wells = []
    
    def add_projectile(self, projectile: Projectile) -> None:
        """Add projectile to the system"""
        self.projectiles.append(projectile)
    
    def remove_projectile(self, projectile: Projectile) -> None:
        """Remove projectile from the system"""
        if projectile in self.projectiles:
            self.projectiles.remove(projectile)
    
    def update(self, dt: float) -> None:
        """Update all projectiles"""
        for projectile in self.projectiles[:]:  # Copy list to allow removal during iteration
            if projectile.is_active:
                self.update_projectile(projectile, dt)
            else:
                self.remove_projectile(projectile)
    
    def update_projectile(self, projectile: Projectile, dt: float) -> None:
        """Update individual projectile"""
        # Apply forces
        effective_gravity = self.calculate_effective_gravity(projectile.position)
        projectile.apply_forces(effective_gravity, self.air_density, self.wind_velocity)
        
        # Integration
        acceleration = projectile.total_force / projectile.mass
        projectile.velocity += acceleration * dt
        projectile.position += projectile.velocity * dt
        
        # Update flight data
        projectile.flight_time += dt
        projectile.max_height = min(projectile.max_height, projectile.position.y)  # Min because Y increases downward
        projectile.distance_traveled = projectile.position.distance_to(
            Vector2D(projectile.position.x - projectile.initial_velocity.x * projectile.flight_time, 
                    projectile.position.y - projectile.initial_velocity.y * projectile.flight_time)
        )
        
        # Ground collision
        if projectile.position.y >= self.ground_level - projectile.radius:
            self.handle_ground_collision(projectile)
        
        # Obstacle collisions
        for obstacle in self.obstacles:
            if self.check_projectile_obstacle_collision(projectile, obstacle):
                self.handle_obstacle_collision(projectile, obstacle)
        
        # Update trail
        projectile.trail_points.append(projectile.position.copy())
        if len(projectile.trail_points) > projectile.max_trail_length:
            projectile.trail_points.pop(0)
        
        # Deactivate if out of bounds or too slow
        if (projectile.position.y > self.ground_level + 100 or 
            projectile.position.x < -100 or projectile.position.x > 900 or
            (projectile.velocity.magnitude < 10 and projectile.has_bounced)):
            projectile.is_active = False
    
    def calculate_effective_gravity(self, position: Vector2D) -> Vector2D:
        """Calculate gravity including gravity wells"""
        effective_gravity = self.gravity.copy()
        
        for well in self.gravity_wells:
            well_position, well_strength, well_radius = well
            distance = position.distance_to(well_position)
            
            if distance < well_radius and distance > 0:
                # Inverse square law
                well_force_magnitude = well_strength / (distance * distance)
                well_direction = (well_position - position).normalize()
                well_force = well_direction * well_force_magnitude
                effective_gravity += well_force
        
        return effective_gravity
    
    def handle_ground_collision(self, projectile: Projectile) -> None:
        """Handle projectile collision with ground"""
        projectile.position.y = self.ground_level - projectile.radius
        
        if not projectile.has_bounced or projectile.velocity.y > 50:  # Allow small bounces
            projectile.velocity.y *= -projectile.bounce_factor
            projectile.velocity.x *= projectile.ground_friction
            projectile.has_bounced = True
        else:
            # Stop bouncing if velocity is too low
            projectile.velocity.y = 0
            projectile.velocity.x *= 0.95  # Rolling friction
    
    def check_projectile_obstacle_collision(self, projectile: Projectile, obstacle: PhysicsBody) -> bool:
        """Check collision between projectile and obstacle"""
        return obstacle.contains_point(projectile.position)
    
    def handle_obstacle_collision(self, projectile: Projectile, obstacle: PhysicsBody) -> None:
        """Handle projectile collision with obstacle"""
        # Simple reflection
        collision_normal = (projectile.position - obstacle.position).normalize()
        projectile.velocity = projectile.velocity.reflect(collision_normal) * 0.8
        
        # Push projectile outside obstacle
        distance_to_surface = obstacle.radius + projectile.radius
        projectile.position = obstacle.position + collision_normal * distance_to_surface
    
    def add_gravity_well(self, position: Vector2D, strength: float, radius: float) -> None:
        """Add a gravity well that affects projectiles"""
        self.gravity_wells.append((position, strength, radius))
    
    def launch_projectile(self, start_pos: Vector2D, velocity: Vector2D, mass: float = 1.0,
                         drag_coefficient: float = 0.47) -> Projectile:
        """Launch a new projectile"""
        projectile = Projectile(start_pos, velocity, mass, drag_coefficient)
        self.add_projectile(projectile)
        return projectile


class Wheel:
    """
    Vehicle wheel with suspension and friction
    """
    
    def __init__(self, position: Vector2D, radius: float = 15.0, mass: float = 2.0):
        self.local_position = position  # Position relative to vehicle
        self.world_position = position.copy()  # World position
        self.radius = radius
        self.mass = mass
        
        # Suspension
        self.suspension_rest_length = 30.0
        self.suspension_stiffness = 800.0
        self.suspension_damping = 50.0
        self.suspension_compression = 0.0
        self.suspension_force = 0.0
        
        # Friction
        self.grip = 1.0
        self.rolling_resistance = 0.02
        self.lateral_friction = 0.8
        self.longitudinal_friction = 0.9
        
        # Forces
        self.ground_force = Vector2D.zero()
        self.friction_force = Vector2D.zero()
        self.suspension_force_vector = Vector2D.zero()
        
        # State
        self.is_grounded = False
        self.ground_normal = Vector2D(0, -1)
        self.slip_ratio = 0.0
        self.angular_velocity = 0.0
        
        # Visual
        self.color = (50, 50, 50)


class Vehicle:
    """
    2D vehicle with realistic physics, suspension, and handling
    """
    
    def __init__(self, position: Vector2D, mass: float = 1000.0):
        self.position = position.copy()
        self.velocity = Vector2D.zero()
        self.angular_velocity = 0.0
        self.angle = 0.0
        self.mass = mass
        
        # Vehicle dimensions
        self.width = 60.0
        self.height = 30.0
        self.wheelbase = 50.0  # Distance between front and rear axles
        self.track_width = 40.0  # Distance between left and right wheels
        
        # Moment of inertia (approximation for rectangle)
        self.moment_of_inertia = (1.0/12.0) * mass * (self.width*self.width + self.height*self.height)
        
        # Create wheels
        self.wheels = [
            Wheel(Vector2D(-self.wheelbase/2, -self.track_width/2)),  # Front left
            Wheel(Vector2D(-self.wheelbase/2, self.track_width/2)),   # Front right
            Wheel(Vector2D(self.wheelbase/2, -self.track_width/2)),   # Rear left
            Wheel(Vector2D(self.wheelbase/2, self.track_width/2))     # Rear right
        ]
        
        # Engine and drivetrain
        self.engine_power = 150000.0  # Watts
        self.max_rpm = 6000.0
        self.current_rpm = 800.0  # Idle RPM
        self.throttle_input = 0.0  # 0-1
        self.brake_input = 0.0     # 0-1
        self.steering_input = 0.0  # -1 to 1
        
        # Vehicle properties
        self.max_steering_angle = math.pi / 6  # 30 degrees
        self.brake_force = 5000.0
        self.downforce_coefficient = 0.5
        self.drag_coefficient = 0.3
        self.frontal_area = 2.0
        
        # Forces
        self.engine_force = Vector2D.zero()
        self.brake_force_vector = Vector2D.zero()
        self.drag_force = Vector2D.zero()
        self.downforce = Vector2D.zero()
        self.total_force = Vector2D.zero()
        self.total_torque = 0.0
        
        # Visual properties
        self.color = (200, 50, 50)
        self.trail_points = []
        
        # Physics settings
        self.gravity = Vector2D(0, 981)
        self.air_density = 1.225
        
        # Ground interaction
        self.ground_level = 550
    
    def update(self, dt: float) -> None:
        """Update vehicle physics"""
        # Update wheel world positions
        self.update_wheel_positions()
        
        # Calculate suspension forces
        self.calculate_suspension_forces()
        
        # Calculate engine force
        self.calculate_engine_force()
        
        # Calculate aerodynamic forces
        self.calculate_aerodynamic_forces()
        
        # Calculate tire forces
        self.calculate_tire_forces()
        
        # Apply steering
        self.apply_steering()
        
        # Integrate motion
        self.integrate_motion(dt)
        
        # Update trail
        self.update_trail()
    
    def update_wheel_positions(self) -> None:
        """Update wheel world positions based on vehicle position and angle"""
        cos_a = math.cos(self.angle)
        sin_a = math.sin(self.angle)
        
        for wheel in self.wheels:
            # Transform local position to world position
            local_x = wheel.local_position.x
            local_y = wheel.local_position.y
            
            world_x = self.position.x + local_x * cos_a - local_y * sin_a
            world_y = self.position.y + local_x * sin_a + local_y * cos_a
            
            wheel.world_position = Vector2D(world_x, world_y)
    
    def calculate_suspension_forces(self) -> None:
        """Calculate suspension forces for each wheel"""
        for wheel in self.wheels:
            # Check if wheel is on ground
            ground_distance = self.ground_level - wheel.world_position.y
            
            if ground_distance <= wheel.suspension_rest_length:
                wheel.is_grounded = True
                wheel.suspension_compression = wheel.suspension_rest_length - ground_distance
                
                # Spring force
                spring_force = wheel.suspension_stiffness * wheel.suspension_compression
                
                # Damping force (simplified)
                wheel_velocity_y = self.velocity.y  # Simplified - should be wheel velocity
                damping_force = wheel.suspension_damping * wheel_velocity_y
                
                wheel.suspension_force = spring_force - damping_force
                wheel.suspension_force_vector = Vector2D(0, -max(0, wheel.suspension_force))
                
            else:
                wheel.is_grounded = False
                wheel.suspension_compression = 0.0
                wheel.suspension_force = 0.0
                wheel.suspension_force_vector = Vector2D.zero()
    
    def calculate_engine_force(self) -> None:
        """Calculate engine force based on throttle input"""
        if self.throttle_input > 0:
            # Simple engine model
            engine_torque = self.engine_power / max(self.current_rpm, 1000) * 60 / (2 * math.pi)
            engine_torque *= self.throttle_input
            
            # Apply to rear wheels (rear-wheel drive)
            rear_wheels = self.wheels[2:]  # Last two wheels are rear
            force_per_wheel = engine_torque / len(rear_wheels)
            
            # Engine force in vehicle forward direction
            self.engine_force = Vector2D.from_angle(self.angle, force_per_wheel * len(rear_wheels))
        else:
            self.engine_force = Vector2D.zero()
    
    def calculate_aerodynamic_forces(self) -> None:
        """Calculate drag and downforce"""
        if self.velocity.magnitude > 0:
            speed_squared = self.velocity.magnitude_squared
            
            # Drag force
            drag_magnitude = 0.5 * self.air_density * self.drag_coefficient * self.frontal_area * speed_squared
            self.drag_force = -self.velocity.normalize() * drag_magnitude
            
            # Downforce
            downforce_magnitude = 0.5 * self.air_density * self.downforce_coefficient * self.frontal_area * speed_squared
            self.downforce = Vector2D(0, downforce_magnitude)
        else:
            self.drag_force = Vector2D.zero()
            self.downforce = Vector2D.zero()
    
    def calculate_tire_forces(self) -> None:
        """Calculate tire friction forces"""
        for wheel in self.wheels:
            wheel.friction_force = Vector2D.zero()
            
            if wheel.is_grounded:
                # Normal force (from suspension + downforce + gravity)
                normal_force = wheel.suspension_force + (self.mass * self.gravity.magnitude / len(self.wheels))
                normal_force += self.downforce.magnitude / len(self.wheels)
                
                # Longitudinal friction (acceleration/braking)
                longitudinal_velocity = self.velocity.dot(Vector2D.from_angle(self.angle))
                if abs(longitudinal_velocity) > 0.1:
                    longitudinal_friction = -longitudinal_velocity * wheel.longitudinal_friction * normal_force / self.velocity.magnitude
                    wheel.friction_force += Vector2D.from_angle(self.angle, longitudinal_friction)
                
                # Lateral friction (cornering)
                lateral_velocity = self.velocity.dot(Vector2D.from_angle(self.angle + math.pi/2))
                if abs(lateral_velocity) > 0.1:
                    lateral_friction = -lateral_velocity * wheel.lateral_friction * normal_force / self.velocity.magnitude
                    wheel.friction_force += Vector2D.from_angle(self.angle + math.pi/2, lateral_friction)
                
                # Rolling resistance
                if self.velocity.magnitude > 0:
                    rolling_resistance = -self.velocity.normalize() * wheel.rolling_resistance * normal_force
                    wheel.friction_force += rolling_resistance
    
    def apply_steering(self) -> None:
        """Apply steering to front wheels"""
        if abs(self.steering_input) > 0.01:
            steering_angle = self.steering_input * self.max_steering_angle
            
            # Ackermann steering geometry (simplified)
            front_wheels = self.wheels[:2]  # First two wheels are front
            for wheel in front_wheels:
                if wheel.is_grounded:
                    # Calculate steering force
                    steering_force_magnitude = abs(self.velocity.magnitude) * self.steering_input * 100
                    steering_force = Vector2D.from_angle(self.angle + math.pi/2, steering_force_magnitude)
                    wheel.friction_force += steering_force
    
    def integrate_motion(self, dt: float) -> None:
        """Integrate vehicle motion"""
        # Sum all forces
        self.total_force = self.engine_force + self.drag_force
        self.total_torque = 0.0
        
        # Add forces from wheels
        for wheel in self.wheels:
            self.total_force += wheel.friction_force + wheel.suspension_force_vector
            
            # Calculate torque from wheel forces
            r = wheel.world_position - self.position
            self.total_torque += r.cross(wheel.friction_force)
        
        # Add gravity
        self.total_force += self.gravity * self.mass
        
        # Update linear motion
        acceleration = self.total_force / self.mass
        self.velocity += acceleration * dt
        self.position += self.velocity * dt
        
        # Update angular motion
        angular_acceleration = self.total_torque / self.moment_of_inertia
        self.angular_velocity += angular_acceleration * dt
        self.angle += self.angular_velocity * dt
        
        # Apply damping
        self.velocity *= 0.999
        self.angular_velocity *= 0.98
        
        # Update RPM based on speed (simplified)
        self.current_rpm = 800 + abs(self.velocity.magnitude) * 50  # Idle + speed factor
        self.current_rpm = clamp(self.current_rpm, 0, self.max_rpm)
    
    def update_trail(self) -> None:
        """Update vehicle trail"""
        self.trail_points.append(self.position.copy())
        if len(self.trail_points) > 100:
            self.trail_points.pop(0)
    
    def set_input(self, throttle: float, brake: float, steering: float) -> None:
        """Set vehicle control inputs"""
        self.throttle_input = clamp(throttle, 0.0, 1.0)
        self.brake_input = clamp(brake, 0.0, 1.0)
        self.steering_input = clamp(steering, -1.0, 1.0)

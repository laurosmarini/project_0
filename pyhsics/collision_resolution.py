"""
Collision Resolution System
Handles collision response with momentum conservation, friction, and restitution
"""

import math
from typing import List
from vector2d import Vector2D
from physics_body import PhysicsBody
from collision_detection import CollisionManifold


class CollisionResolver:
    """
    Resolves collisions between physics bodies with realistic physics
    """
    
    def __init__(self, position_correction_percent: float = 0.8, 
                 position_correction_slop: float = 0.01):
        """
        Initialize the collision resolver
        
        Args:
            position_correction_percent: How much to correct position overlap
            position_correction_slop: Minimum penetration before correction
        """
        self.position_correction_percent = position_correction_percent
        self.position_correction_slop = position_correction_slop
        self.solved_collisions = []
    
    def resolve_collision(self, manifold: CollisionManifold) -> None:
        """
        Resolve a collision between two bodies
        
        Args:
            manifold: Collision information
        """
        if not manifold.is_colliding:
            return
        
        body_a = manifold.body_a
        body_b = manifold.body_b
        
        # Wake up sleeping bodies
        if body_a.sleeping:
            body_a.wake_up()
        if body_b.sleeping:
            body_b.wake_up()
        
        # Update collision statistics
        body_a.collision_count += 1
        body_b.collision_count += 1
        
        # Resolve velocity (impulse-based)
        self._resolve_velocity(manifold)
        
        # Resolve position (penetration correction)
        self._resolve_position(manifold)
        
        # Apply friction
        self._apply_friction(manifold)
        
        self.solved_collisions.append(manifold)
    
    def _resolve_velocity(self, manifold: CollisionManifold) -> None:
        """
        Resolve collision velocities using impulse-based method
        """
        body_a = manifold.body_a
        body_b = manifold.body_b
        normal = manifold.normal
        
        # Calculate relative velocity in collision normal direction
        relative_velocity = body_b.velocity - body_a.velocity
        velocity_along_normal = relative_velocity.dot(normal)
        
        # Don't resolve if velocities are separating
        if velocity_along_normal > 0:
            return
        
        # Calculate restitution
        restitution = manifold.restitution
        
        # Calculate impulse scalar
        impulse_scalar = -(1 + restitution) * velocity_along_normal
        impulse_scalar /= body_a.inv_mass + body_b.inv_mass
        
        # Handle angular effects if we have contact points
        if manifold.contact_points:
            contact_point = manifold.contact_points[0]
            
            # Calculate radius vectors from center of mass to contact point
            ra = contact_point - body_a.position
            rb = contact_point - body_b.position
            
            # Calculate angular contribution to impulse
            ra_perp = ra.perpendicular()
            rb_perp = rb.perpendicular()
            
            angular_contribution = (ra_perp.dot(normal) ** 2 * body_a.inv_inertia +
                                  rb_perp.dot(normal) ** 2 * body_b.inv_inertia)
            
            impulse_scalar = -(1 + restitution) * velocity_along_normal
            impulse_scalar /= (body_a.inv_mass + body_b.inv_mass + angular_contribution)
        
        # Apply impulse
        impulse = normal * impulse_scalar
        
        # Apply linear impulse
        body_a.velocity -= impulse * body_a.inv_mass
        body_b.velocity += impulse * body_b.inv_mass
        
        # Apply angular impulse if we have contact points
        if manifold.contact_points:
            contact_point = manifold.contact_points[0]
            ra = contact_point - body_a.position
            rb = contact_point - body_b.position
            
            body_a.angular_velocity -= ra.cross(impulse) * body_a.inv_inertia
            body_b.angular_velocity += rb.cross(impulse) * body_b.inv_inertia
    
    def _resolve_position(self, manifold: CollisionManifold) -> None:
        """
        Resolve position overlap using linear projection
        """
        body_a = manifold.body_a
        body_b = manifold.body_b
        
        # Only correct position if penetration is significant
        if manifold.penetration <= self.position_correction_slop:
            return
        
        # Calculate correction amount
        correction_magnitude = (manifold.penetration - self.position_correction_slop) * self.position_correction_percent
        correction = manifold.normal * correction_magnitude
        
        # Apply position correction proportional to inverse mass
        total_inv_mass = body_a.inv_mass + body_b.inv_mass
        
        if total_inv_mass > 0:
            correction_a = correction * (body_a.inv_mass / total_inv_mass)
            correction_b = correction * (body_b.inv_mass / total_inv_mass)
            
            body_a.position -= correction_a
            body_b.position += correction_b
            
            # Update polygon vertices if needed
            if body_a.body_type == "polygon":
                body_a.update_polygon_vertices()
            if body_b.body_type == "polygon":
                body_b.update_polygon_vertices()
    
    def _apply_friction(self, manifold: CollisionManifold) -> None:
        """
        Apply friction forces to the collision
        """
        body_a = manifold.body_a
        body_b = manifold.body_b
        normal = manifold.normal
        
        # Calculate relative velocity
        relative_velocity = body_b.velocity - body_a.velocity
        
        # Calculate tangent vector (perpendicular to normal)
        tangent = relative_velocity - normal * relative_velocity.dot(normal)
        
        if tangent.magnitude_squared < 1e-6:
            return  # No relative tangential motion
        
        tangent = tangent.normalize()
        
        # Calculate friction impulse
        velocity_along_tangent = relative_velocity.dot(tangent)
        friction_impulse_scalar = -velocity_along_tangent / (body_a.inv_mass + body_b.inv_mass)
        
        # Apply Coulomb friction
        normal_impulse_magnitude = abs(-(1 + manifold.restitution) * relative_velocity.dot(normal) / 
                                     (body_a.inv_mass + body_b.inv_mass))
        
        max_friction_impulse = manifold.friction * normal_impulse_magnitude
        
        # Clamp friction impulse
        if abs(friction_impulse_scalar) > max_friction_impulse:
            friction_impulse_scalar = max_friction_impulse * (1 if friction_impulse_scalar > 0 else -1)
        
        friction_impulse = tangent * friction_impulse_scalar
        
        # Apply friction impulse
        body_a.velocity -= friction_impulse * body_a.inv_mass
        body_b.velocity += friction_impulse * body_b.inv_mass
        
        # Apply angular friction if we have contact points
        if manifold.contact_points:
            contact_point = manifold.contact_points[0]
            ra = contact_point - body_a.position
            rb = contact_point - body_b.position
            
            body_a.angular_velocity -= ra.cross(friction_impulse) * body_a.inv_inertia
            body_b.angular_velocity += rb.cross(friction_impulse) * body_b.inv_inertia


class ConstraintSolver:
    """
    Solves constraints between physics bodies (joints, springs, etc.)
    """
    
    def __init__(self):
        self.constraints = []
    
    def add_constraint(self, constraint) -> None:
        """Add a constraint to be solved"""
        self.constraints.append(constraint)
    
    def remove_constraint(self, constraint) -> None:
        """Remove a constraint"""
        if constraint in self.constraints:
            self.constraints.remove(constraint)
    
    def solve_constraints(self, dt: float) -> None:
        """Solve all constraints"""
        for constraint in self.constraints:
            constraint.solve(dt)


class Joint:
    """
    Base class for joints between two bodies
    """
    
    def __init__(self, body_a: PhysicsBody, body_b: PhysicsBody):
        self.body_a = body_a
        self.body_b = body_b
        self.break_force = float('inf')
        self.is_broken = False
    
    def solve(self, dt: float) -> None:
        """Solve the joint constraint"""
        pass
    
    def get_constraint_force(self) -> float:
        """Get the current constraint force"""
        return 0.0
    
    def break_joint(self) -> None:
        """Break the joint"""
        self.is_broken = True


class DistanceJoint(Joint):
    """
    Distance joint maintains constant distance between two bodies
    """
    
    def __init__(self, body_a: PhysicsBody, body_b: PhysicsBody, 
                 distance: float = None, stiffness: float = 1.0, damping: float = 0.1):
        super().__init__(body_a, body_b)
        
        if distance is None:
            self.rest_distance = body_a.position.distance_to(body_b.position)
        else:
            self.rest_distance = distance
        
        self.stiffness = stiffness
        self.damping = damping
    
    def solve(self, dt: float) -> None:
        """Solve distance constraint"""
        if self.is_broken:
            return
        
        # Calculate current distance and direction
        diff = self.body_b.position - self.body_a.position
        current_distance = diff.magnitude
        
        if current_distance < 1e-6:
            return
        
        direction = diff.normalize()
        
        # Calculate constraint violation
        violation = current_distance - self.rest_distance
        
        # Calculate relative velocity
        relative_velocity = self.body_b.velocity - self.body_a.velocity
        relative_velocity_along_constraint = relative_velocity.dot(direction)
        
        # Calculate constraint force
        force_magnitude = -self.stiffness * violation - self.damping * relative_velocity_along_constraint
        force = direction * force_magnitude
        
        # Check if joint should break
        if abs(force_magnitude) > self.break_force:
            self.break_joint()
            return
        
        # Apply constraint force
        self.body_a.apply_force(-force * dt)
        self.body_b.apply_force(force * dt)


class SpringJoint(Joint):
    """
    Spring joint applies spring force between two bodies
    """
    
    def __init__(self, body_a: PhysicsBody, body_b: PhysicsBody,
                 rest_length: float = None, spring_constant: float = 100.0, 
                 damping: float = 5.0):
        super().__init__(body_a, body_b)
        
        if rest_length is None:
            self.rest_length = body_a.position.distance_to(body_b.position)
        else:
            self.rest_length = rest_length
        
        self.spring_constant = spring_constant
        self.damping = damping
    
    def solve(self, dt: float) -> None:
        """Solve spring constraint"""
        if self.is_broken:
            return
        
        # Calculate spring vector
        spring_vector = self.body_b.position - self.body_a.position
        current_length = spring_vector.magnitude
        
        if current_length < 1e-6:
            return
        
        direction = spring_vector.normalize()
        
        # Hooke's law: F = -k * x
        extension = current_length - self.rest_length
        spring_force_magnitude = -self.spring_constant * extension
        
        # Add damping force
        relative_velocity = self.body_b.velocity - self.body_a.velocity
        damping_force_magnitude = -self.damping * relative_velocity.dot(direction)
        
        total_force_magnitude = spring_force_magnitude + damping_force_magnitude
        force = direction * total_force_magnitude
        
        # Check if joint should break
        if abs(total_force_magnitude) > self.break_force:
            self.break_joint()
            return
        
        # Apply spring force
        self.body_a.apply_force(-force)
        self.body_b.apply_force(force)


class RevoluteJoint(Joint):
    """
    Revolute joint allows rotation around a fixed point
    """
    
    def __init__(self, body_a: PhysicsBody, body_b: PhysicsBody, 
                 anchor_a: Vector2D, anchor_b: Vector2D):
        super().__init__(body_a, body_b)
        self.local_anchor_a = anchor_a
        self.local_anchor_b = anchor_b
    
    def solve(self, dt: float) -> None:
        """Solve revolute joint constraint"""
        if self.is_broken:
            return
        
        # Transform local anchors to world space
        world_anchor_a = self.body_a.position + self.local_anchor_a.rotate(self.body_a.angle)
        world_anchor_b = self.body_b.position + self.local_anchor_b.rotate(self.body_b.angle)
        
        # Calculate constraint violation
        constraint_violation = world_anchor_b - world_anchor_a
        
        if constraint_violation.magnitude_squared < 1e-6:
            return
        
        # Apply position correction
        correction_factor = 0.8
        correction = constraint_violation * correction_factor
        
        total_inv_mass = self.body_a.inv_mass + self.body_b.inv_mass
        
        if total_inv_mass > 0:
            self.body_a.position += correction * (self.body_a.inv_mass / total_inv_mass)
            self.body_b.position -= correction * (self.body_b.inv_mass / total_inv_mass)

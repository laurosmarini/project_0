"""
Soft Body and Ragdoll Physics System
Implements mass-spring systems for soft body deformation and ragdoll physics with joint constraints
"""

import math
import random
from typing import List, Dict, Tuple, Optional
from vector2d import Vector2D
from physics_body import PhysicsBody
from collision_resolution import Joint, SpringJoint, DistanceJoint, RevoluteJoint


class MassPoint:
    """
    Individual mass point in soft body system
    """
    
    def __init__(self, position: Vector2D, mass: float = 1.0, pinned: bool = False):
        self.position = position.copy()
        self.old_position = position.copy()
        self.velocity = Vector2D.zero()
        self.acceleration = Vector2D.zero()
        self.force = Vector2D.zero()
        
        self.mass = mass
        self.inv_mass = 1.0 / mass if not pinned else 0.0
        self.pinned = pinned
        
        self.radius = 3.0
        self.color = (255, 255, 255)
        self.collision_radius = 2.0
        
        # Constraints
        self.constraints = []
        
        # Visual properties
        self.original_position = position.copy()
        self.displacement = Vector2D.zero()


class Spring:
    """
    Spring connection between two mass points
    """
    
    def __init__(self, point_a: MassPoint, point_b: MassPoint, 
                 stiffness: float = 1.0, damping: float = 0.1, 
                 rest_length: float = None):
        self.point_a = point_a
        self.point_b = point_b
        self.stiffness = stiffness
        self.damping = damping
        self.rest_length = rest_length if rest_length else point_a.position.distance_to(point_b.position)
        
        # Visual properties
        self.thickness = 1.0
        self.color = (200, 200, 200)
        
        # Constraint properties
        self.break_threshold = float('inf')
        self.is_broken = False
        
        # Current state
        self.current_force = 0.0
    
    def update(self, dt: float) -> None:
        """Update spring forces"""
        if self.is_broken:
            return
        
        # Calculate spring vector
        spring_vector = self.point_b.position - self.point_a.position
        current_length = spring_vector.magnitude
        
        if current_length < 1e-6:
            return
        
        direction = spring_vector.normalize()
        
        # Hooke's law: F = -k * x
        extension = current_length - self.rest_length
        spring_force_magnitude = -self.stiffness * extension
        
        # Damping force
        relative_velocity = self.point_b.velocity - self.point_a.velocity
        damping_force_magnitude = -self.damping * relative_velocity.dot(direction)
        
        total_force_magnitude = spring_force_magnitude + damping_force_magnitude
        self.current_force = abs(total_force_magnitude)
        
        # Check if spring should break
        if self.current_force > self.break_threshold:
            self.is_broken = True
            return
        
        force = direction * total_force_magnitude
        
        # Apply forces to points
        self.point_a.force -= force
        self.point_b.force += force


class SoftBody:
    """
    Soft body made of mass points connected by springs
    """
    
    def __init__(self, center: Vector2D, width: float, height: float, 
                 resolution: int = 8, stiffness: float = 500.0, damping: float = 10.0):
        self.center = center
        self.width = width
        self.height = height
        self.resolution = resolution
        self.stiffness = stiffness
        self.damping = damping
        
        self.mass_points = []
        self.springs = []
        self.constraints = []
        
        # Material properties
        self.density = 1.0
        self.pressure = 0.0
        self.volume = width * height
        self.rest_volume = self.volume
        
        # Visual properties
        self.color = (100, 255, 100)
        self.outline_color = (50, 200, 50)
        self.show_structure = True
        
        # Physics properties
        self.gravity = Vector2D(0, 981)  # 9.81 m/s^2 * 100 for pixel scale
        self.air_resistance = 0.02
        
        # Create the soft body structure
        self.create_structure()
    
    def create_structure(self) -> None:
        """Create mass-spring structure for soft body"""
        # Create mass points in a grid
        for y in range(self.resolution):
            row = []
            for x in range(self.resolution):
                pos = Vector2D(
                    self.center.x - self.width/2 + (x * self.width / (self.resolution - 1)),
                    self.center.y - self.height/2 + (y * self.height / (self.resolution - 1))
                )
                mass_point = MassPoint(pos, self.density)
                self.mass_points.append(mass_point)
                row.append(mass_point)
        
        # Create springs between adjacent mass points
        for y in range(self.resolution):
            for x in range(self.resolution):
                current_idx = y * self.resolution + x
                current_point = self.mass_points[current_idx]
                
                # Horizontal springs
                if x < self.resolution - 1:
                    right_idx = y * self.resolution + (x + 1)
                    right_point = self.mass_points[right_idx]
                    spring = Spring(current_point, right_point, self.stiffness, self.damping)
                    self.springs.append(spring)
                
                # Vertical springs
                if y < self.resolution - 1:
                    down_idx = (y + 1) * self.resolution + x
                    down_point = self.mass_points[down_idx]
                    spring = Spring(current_point, down_point, self.stiffness, self.damping)
                    self.springs.append(spring)
                
                # Diagonal springs for stability (optional)
                if x < self.resolution - 1 and y < self.resolution - 1:
                    diagonal_idx = (y + 1) * self.resolution + (x + 1)
                    diagonal_point = self.mass_points[diagonal_idx]
                    spring = Spring(current_point, diagonal_point, 
                                  self.stiffness * 0.5, self.damping * 0.5)
                    self.springs.append(spring)
                
                # Anti-diagonal springs
                if x > 0 and y < self.resolution - 1:
                    anti_diagonal_idx = (y + 1) * self.resolution + (x - 1)
                    anti_diagonal_point = self.mass_points[anti_diagonal_idx]
                    spring = Spring(current_point, anti_diagonal_point,
                                  self.stiffness * 0.5, self.damping * 0.5)
                    self.springs.append(spring)
    
    def update(self, dt: float) -> None:
        """Update soft body simulation"""
        # Clear forces
        for point in self.mass_points:
            point.force = Vector2D.zero()
        
        # Apply gravity
        for point in self.mass_points:
            if not point.pinned:
                point.force += self.gravity * point.mass
        
        # Apply air resistance
        for point in self.mass_points:
            if not point.pinned:
                drag = point.velocity * (-self.air_resistance * point.velocity.magnitude)
                point.force += drag
        
        # Update springs
        for spring in self.springs:
            if not spring.is_broken:
                spring.update(dt)
        
        # Apply pressure forces for volume preservation
        self.apply_pressure_forces()
        
        # Integrate motion
        for point in self.mass_points:
            if not point.pinned:
                self.integrate_point(point, dt)
        
        # Apply constraints
        self.apply_constraints()
        
        # Update visual properties
        self.update_visual_properties()
    
    def integrate_point(self, point: MassPoint, dt: float) -> None:
        """Integrate point motion using Verlet integration"""
        acceleration = point.force * point.inv_mass
        
        # Verlet integration
        new_position = point.position * 2.0 - point.old_position + acceleration * (dt * dt)
        
        point.velocity = (new_position - point.old_position) / (2.0 * dt)
        point.old_position = point.position.copy()
        point.position = new_position
    
    def apply_pressure_forces(self) -> None:
        """Apply internal pressure to maintain volume"""
        current_volume = self.calculate_volume()
        volume_ratio = current_volume / self.rest_volume
        
        # Apply pressure based on volume change
        if volume_ratio < 1.0:  # Compressed
            pressure_magnitude = (1.0 - volume_ratio) * 1000.0
            
            center = self.get_center()
            for point in self.mass_points:
                if not point.pinned:
                    direction = (point.position - center)
                    if direction.magnitude > 0:
                        direction = direction.normalize()
                        pressure_force = direction * pressure_magnitude
                        point.force += pressure_force
    
    def calculate_volume(self) -> float:
        """Calculate current volume using shoelace formula"""
        if len(self.mass_points) < 3:
            return 0.0
        
        # Use convex hull or simplified polygon area
        area = 0.0
        n = len(self.mass_points)
        
        for i in range(n):
            j = (i + 1) % n
            area += self.mass_points[i].position.x * self.mass_points[j].position.y
            area -= self.mass_points[j].position.x * self.mass_points[i].position.y
        
        return abs(area) / 2.0
    
    def get_center(self) -> Vector2D:
        """Get center of mass"""
        center = Vector2D.zero()
        total_mass = 0.0
        
        for point in self.mass_points:
            center += point.position * point.mass
            total_mass += point.mass
        
        if total_mass > 0:
            center /= total_mass
        
        return center
    
    def apply_constraints(self) -> None:
        """Apply position constraints"""
        for constraint in self.constraints:
            constraint.apply()
    
    def update_visual_properties(self) -> None:
        """Update visual properties based on deformation"""
        center = self.get_center()
        
        for point in self.mass_points:
            point.displacement = point.position - point.original_position
            
            # Color based on stress
            stress = point.displacement.magnitude / 10.0
            stress_factor = min(stress, 1.0)
            
            # Green to red based on stress
            point.color = (
                int(100 + 155 * stress_factor),  # Red
                int(255 - 155 * stress_factor),  # Green
                100  # Blue
            )
    
    def add_constraint(self, constraint) -> None:
        """Add a position constraint"""
        self.constraints.append(constraint)
    
    def pin_point(self, index: int) -> None:
        """Pin a mass point in place"""
        if 0 <= index < len(self.mass_points):
            self.mass_points[index].pinned = True
            self.mass_points[index].inv_mass = 0.0
    
    def apply_force_at_point(self, index: int, force: Vector2D) -> None:
        """Apply force to a specific mass point"""
        if 0 <= index < len(self.mass_points):
            self.mass_points[index].force += force


class RagdollBone:
    """
    Individual bone in a ragdoll system
    """
    
    def __init__(self, position: Vector2D, length: float, angle: float = 0.0, mass: float = 1.0):
        self.position = position
        self.length = length
        self.angle = angle
        self.mass = mass
        
        self.velocity = Vector2D.zero()
        self.angular_velocity = 0.0
        self.force = Vector2D.zero()
        self.torque = 0.0
        
        # Calculate endpoints
        self.update_endpoints()
        
        # Visual properties
        self.thickness = 8.0
        self.color = (200, 150, 100)  # Bone color
        
        # Physics properties
        self.moment_of_inertia = (1.0/12.0) * mass * length * length
        self.inv_inertia = 1.0 / self.moment_of_inertia if self.moment_of_inertia > 0 else 0.0
    
    def update_endpoints(self) -> None:
        """Update bone endpoints based on position and angle"""
        half_length = self.length / 2.0
        cos_a = math.cos(self.angle)
        sin_a = math.sin(self.angle)
        
        offset = Vector2D(cos_a * half_length, sin_a * half_length)
        self.start = self.position - offset
        self.end = self.position + offset
    
    def apply_force_at_point(self, force: Vector2D, point: Vector2D) -> None:
        """Apply force at a specific point on the bone"""
        self.force += force
        
        # Calculate torque
        r = point - self.position
        self.torque += r.cross(force)
    
    def integrate(self, dt: float) -> None:
        """Integrate bone motion"""
        # Linear motion
        acceleration = self.force / self.mass
        self.velocity += acceleration * dt
        self.position += self.velocity * dt
        
        # Angular motion
        angular_acceleration = self.torque * self.inv_inertia
        self.angular_velocity += angular_acceleration * dt
        self.angle += self.angular_velocity * dt
        
        # Update endpoints
        self.update_endpoints()
        
        # Apply damping
        self.velocity *= 0.99
        self.angular_velocity *= 0.99
        
        # Clear forces
        self.force = Vector2D.zero()
        self.torque = 0.0


class RagdollSystem:
    """
    Ragdoll physics system with bones and joints
    """
    
    def __init__(self, position: Vector2D):
        self.position = position
        self.bones = []
        self.joints = []
        
        # Physics properties
        self.gravity = Vector2D(0, 981)
        
        # Create ragdoll structure
        self.create_ragdoll()
    
    def create_ragdoll(self) -> None:
        """Create a simple humanoid ragdoll"""
        # Body parts lengths
        torso_length = 60
        head_length = 20
        upper_arm_length = 30
        lower_arm_length = 25
        upper_leg_length = 35
        lower_leg_length = 30
        
        # Create bones
        # Torso (center bone)
        torso = RagdollBone(self.position, torso_length, math.pi/2, 3.0)
        self.bones.append(torso)
        
        # Head
        head_pos = torso.start + Vector2D(0, -head_length/2)
        head = RagdollBone(head_pos, head_length, math.pi/2, 1.0)
        self.bones.append(head)
        
        # Arms
        shoulder_pos = torso.start + Vector2D(0, -10)
        
        # Left arm
        left_upper_arm_pos = shoulder_pos + Vector2D(-upper_arm_length/2, 0)
        left_upper_arm = RagdollBone(left_upper_arm_pos, upper_arm_length, 0, 1.5)
        self.bones.append(left_upper_arm)
        
        left_elbow_pos = left_upper_arm.end
        left_lower_arm_pos = left_elbow_pos + Vector2D(-lower_arm_length/2, 0)
        left_lower_arm = RagdollBone(left_lower_arm_pos, lower_arm_length, 0, 1.0)
        self.bones.append(left_lower_arm)
        
        # Right arm
        right_upper_arm_pos = shoulder_pos + Vector2D(upper_arm_length/2, 0)
        right_upper_arm = RagdollBone(right_upper_arm_pos, upper_arm_length, 0, 1.5)
        self.bones.append(right_upper_arm)
        
        right_elbow_pos = right_upper_arm.end
        right_lower_arm_pos = right_elbow_pos + Vector2D(lower_arm_length/2, 0)
        right_lower_arm = RagdollBone(right_lower_arm_pos, lower_arm_length, 0, 1.0)
        self.bones.append(right_lower_arm)
        
        # Legs
        hip_pos = torso.end
        
        # Left leg
        left_upper_leg_pos = hip_pos + Vector2D(-10, upper_leg_length/2)
        left_upper_leg = RagdollBone(left_upper_leg_pos, upper_leg_length, math.pi/2, 2.0)
        self.bones.append(left_upper_leg)
        
        left_knee_pos = left_upper_leg.end
        left_lower_leg_pos = left_knee_pos + Vector2D(0, lower_leg_length/2)
        left_lower_leg = RagdollBone(left_lower_leg_pos, lower_leg_length, math.pi/2, 1.5)
        self.bones.append(left_lower_leg)
        
        # Right leg
        right_upper_leg_pos = hip_pos + Vector2D(10, upper_leg_length/2)
        right_upper_leg = RagdollBone(right_upper_leg_pos, upper_leg_length, math.pi/2, 2.0)
        self.bones.append(right_upper_leg)
        
        right_knee_pos = right_upper_leg.end
        right_lower_leg_pos = right_knee_pos + Vector2D(0, lower_leg_length/2)
        right_lower_leg = RagdollBone(right_lower_leg_pos, lower_leg_length, math.pi/2, 1.5)
        self.bones.append(right_lower_leg)
        
        # Create joints
        # Neck joint
        neck_joint = RagdollJoint(torso, head, torso.start, Vector2D(0, head_length/2))
        neck_joint.set_angle_limits(-math.pi/4, math.pi/4)
        self.joints.append(neck_joint)
        
        # Shoulder joints
        left_shoulder = RagdollJoint(torso, left_upper_arm, 
                                   Vector2D(0, -10), Vector2D(upper_arm_length/2, 0))
        left_shoulder.set_angle_limits(-math.pi, math.pi)
        self.joints.append(left_shoulder)
        
        right_shoulder = RagdollJoint(torso, right_upper_arm,
                                    Vector2D(0, -10), Vector2D(-upper_arm_length/2, 0))
        right_shoulder.set_angle_limits(-math.pi, math.pi)
        self.joints.append(right_shoulder)
        
        # Elbow joints
        left_elbow = RagdollJoint(left_upper_arm, left_lower_arm,
                                Vector2D(-upper_arm_length/2, 0), Vector2D(lower_arm_length/2, 0))
        left_elbow.set_angle_limits(-math.pi/6, math.pi/2)
        self.joints.append(left_elbow)
        
        right_elbow = RagdollJoint(right_upper_arm, right_lower_arm,
                                 Vector2D(upper_arm_length/2, 0), Vector2D(-lower_arm_length/2, 0))
        right_elbow.set_angle_limits(-math.pi/6, math.pi/2)
        self.joints.append(right_elbow)
        
        # Hip joints
        left_hip = RagdollJoint(torso, left_upper_leg,
                              Vector2D(-5, torso_length/2), Vector2D(0, -upper_leg_length/2))
        left_hip.set_angle_limits(-math.pi/3, math.pi/3)
        self.joints.append(left_hip)
        
        right_hip = RagdollJoint(torso, right_upper_leg,
                               Vector2D(5, torso_length/2), Vector2D(0, -upper_leg_length/2))
        right_hip.set_angle_limits(-math.pi/3, math.pi/3)
        self.joints.append(right_hip)
        
        # Knee joints
        left_knee = RagdollJoint(left_upper_leg, left_lower_leg,
                               Vector2D(0, upper_leg_length/2), Vector2D(0, -lower_leg_length/2))
        left_knee.set_angle_limits(-math.pi/2, 0)
        self.joints.append(left_knee)
        
        right_knee = RagdollJoint(right_upper_leg, right_lower_leg,
                                Vector2D(0, upper_leg_length/2), Vector2D(0, -lower_leg_length/2))
        right_knee.set_angle_limits(-math.pi/2, 0)
        self.joints.append(right_knee)
    
    def update(self, dt: float) -> None:
        """Update ragdoll simulation"""
        # Apply gravity to all bones
        for bone in self.bones:
            bone.force += self.gravity * bone.mass
        
        # Solve joint constraints
        for _ in range(3):  # Multiple iterations for stability
            for joint in self.joints:
                joint.solve_position_constraint()
                joint.solve_angle_constraint()
        
        # Integrate bone motion
        for bone in self.bones:
            bone.integrate(dt)
    
    def apply_impulse_at_point(self, point: Vector2D, impulse: Vector2D) -> None:
        """Apply impulse at a specific world point"""
        # Find the closest bone
        closest_bone = None
        min_distance = float('inf')
        
        for bone in self.bones:
            # Distance from point to bone line segment
            distance = self.point_to_line_distance(point, bone.start, bone.end)
            if distance < min_distance:
                min_distance = distance
                closest_bone = bone
        
        if closest_bone and min_distance < 20:  # Within reasonable distance
            closest_bone.apply_force_at_point(impulse, point)
    
    def point_to_line_distance(self, point: Vector2D, line_start: Vector2D, line_end: Vector2D) -> float:
        """Calculate distance from point to line segment"""
        line_vec = line_end - line_start
        point_vec = point - line_start
        
        if line_vec.magnitude_squared == 0:
            return point_vec.magnitude
        
        t = max(0, min(1, point_vec.dot(line_vec) / line_vec.magnitude_squared))
        projection = line_start + line_vec * t
        return point.distance_to(projection)


class RagdollJoint:
    """
    Joint constraint for ragdoll system
    """
    
    def __init__(self, bone_a: RagdollBone, bone_b: RagdollBone, 
                 anchor_a: Vector2D, anchor_b: Vector2D):
        self.bone_a = bone_a
        self.bone_b = bone_b
        self.local_anchor_a = anchor_a  # Local to bone_a
        self.local_anchor_b = anchor_b  # Local to bone_b
        
        # Angle constraints
        self.min_angle = -math.pi
        self.max_angle = math.pi
        self.has_angle_limits = False
        
        # Joint properties
        self.stiffness = 1.0
        self.damping = 0.1
    
    def set_angle_limits(self, min_angle: float, max_angle: float) -> None:
        """Set angle limits for the joint"""
        self.min_angle = min_angle
        self.max_angle = max_angle
        self.has_angle_limits = True
    
    def get_world_anchor_a(self) -> Vector2D:
        """Get world position of anchor on bone A"""
        cos_a = math.cos(self.bone_a.angle)
        sin_a = math.sin(self.bone_a.angle)
        
        rotated_x = self.local_anchor_a.x * cos_a - self.local_anchor_a.y * sin_a
        rotated_y = self.local_anchor_a.x * sin_a + self.local_anchor_a.y * cos_a
        
        return self.bone_a.position + Vector2D(rotated_x, rotated_y)
    
    def get_world_anchor_b(self) -> Vector2D:
        """Get world position of anchor on bone B"""
        cos_b = math.cos(self.bone_b.angle)
        sin_b = math.sin(self.bone_b.angle)
        
        rotated_x = self.local_anchor_b.x * cos_b - self.local_anchor_b.y * sin_b
        rotated_y = self.local_anchor_b.x * sin_b + self.local_anchor_b.y * cos_b
        
        return self.bone_b.position + Vector2D(rotated_x, rotated_y)
    
    def solve_position_constraint(self) -> None:
        """Solve position constraint to keep anchors together"""
        anchor_a = self.get_world_anchor_a()
        anchor_b = self.get_world_anchor_b()
        
        constraint_error = anchor_b - anchor_a
        
        if constraint_error.magnitude_squared < 1e-6:
            return
        
        # Calculate correction
        correction_factor = 0.5  # How much to correct each frame
        correction = constraint_error * correction_factor
        
        # Apply position correction
        total_inv_mass = (1.0 / self.bone_a.mass) + (1.0 / self.bone_b.mass)
        
        if total_inv_mass > 0:
            correction_a = correction * (1.0 / self.bone_a.mass) / total_inv_mass
            correction_b = correction * (1.0 / self.bone_b.mass) / total_inv_mass
            
            self.bone_a.position += correction_a
            self.bone_b.position -= correction_b
            
            # Update endpoints
            self.bone_a.update_endpoints()
            self.bone_b.update_endpoints()
    
    def solve_angle_constraint(self) -> None:
        """Solve angle constraint if limits are set"""
        if not self.has_angle_limits:
            return
        
        # Calculate relative angle
        relative_angle = self.bone_b.angle - self.bone_a.angle
        
        # Normalize angle to [-pi, pi]
        while relative_angle > math.pi:
            relative_angle -= 2 * math.pi
        while relative_angle < -math.pi:
            relative_angle += 2 * math.pi
        
        # Check if angle is within limits
        angle_violation = 0.0
        
        if relative_angle < self.min_angle:
            angle_violation = self.min_angle - relative_angle
        elif relative_angle > self.max_angle:
            angle_violation = self.max_angle - relative_angle
        
        if abs(angle_violation) > 1e-6:
            # Apply angle correction
            correction_factor = 0.3
            angle_correction = angle_violation * correction_factor
            
            # Distribute correction between both bones
            total_inv_inertia = self.bone_a.inv_inertia + self.bone_b.inv_inertia
            
            if total_inv_inertia > 0:
                correction_a = angle_correction * self.bone_a.inv_inertia / total_inv_inertia
                correction_b = angle_correction * self.bone_b.inv_inertia / total_inv_inertia
                
                self.bone_a.angle += correction_a
                self.bone_b.angle -= correction_b
                
                # Update endpoints
                self.bone_a.update_endpoints()
                self.bone_b.update_endpoints()

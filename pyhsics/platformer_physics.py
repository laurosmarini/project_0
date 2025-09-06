"""
2D Platformer Physics Engine
Handles character movement, slope collision, moving platforms, and platformer-specific mechanics
"""

import math
from typing import List, Dict, Tuple, Optional
from vector2d import Vector2D, clamp
from physics_body import PhysicsBody


class PlatformerCharacter:
    """
    Platformer character with specialized movement physics
    """
    
    def __init__(self, position: Vector2D, size: Vector2D = None):
        self.position = position.copy()
        self.velocity = Vector2D.zero()
        self.size = size if size else Vector2D(16, 24)  # Width, Height
        
        # Movement properties
        self.max_speed = 200.0
        self.acceleration = 800.0
        self.deceleration = 1200.0
        self.jump_strength = 400.0
        self.gravity = 1200.0
        self.max_fall_speed = 600.0
        
        # State
        self.is_grounded = False
        self.is_on_slope = False
        self.is_against_wall = False
        self.can_wall_jump = False
        self.on_moving_platform = None
        self.platform_velocity = Vector2D.zero()
        
        # Jump mechanics
        self.jump_time = 0.0
        self.max_jump_time = 0.25
        self.is_jumping = False
        self.coyote_time = 0.1
        self.coyote_timer = 0.0
        self.jump_buffer_time = 0.1
        self.jump_buffer_timer = 0.0
        
        # Wall mechanics
        self.wall_slide_speed = 100.0
        self.wall_jump_force = Vector2D(250, -350)
        self.wall_jump_time = 0.2
        self.wall_jump_timer = 0.0
        
        # Slope mechanics
        self.slope_angle = 0.0
        self.slope_factor = 0.8
        self.max_slope_angle = math.pi / 3  # 60 degrees
        
        # Ground detection
        self.ground_check_distance = 4.0
        self.wall_check_distance = 2.0
        
        # Input
        self.input_x = 0.0  # -1, 0, 1
        self.jump_pressed = False
        self.jump_held = False
        
        # Visual properties
        self.color = (100, 200, 100)
        self.facing_right = True
        
        # Collision boxes
        self.collision_box = None
        self.ground_sensors = []
        self.wall_sensors = []
        
        self.update_collision_boxes()
    
    def update_collision_boxes(self) -> None:
        """Update collision detection boxes"""
        half_width = self.size.x / 2
        half_height = self.size.y / 2
        
        # Main collision box
        self.collision_box = {
            'min': Vector2D(self.position.x - half_width, self.position.y - half_height),
            'max': Vector2D(self.position.x + half_width, self.position.y + half_height)
        }
        
        # Ground sensors (bottom of character)
        sensor_y = self.position.y + half_height + self.ground_check_distance
        self.ground_sensors = [
            Vector2D(self.position.x - half_width + 2, sensor_y),  # Left
            Vector2D(self.position.x, sensor_y),                  # Center
            Vector2D(self.position.x + half_width - 2, sensor_y)  # Right
        ]
        
        # Wall sensors (sides of character)
        wall_y_positions = [
            self.position.y - half_height + 4,  # Upper
            self.position.y,                    # Middle
            self.position.y + half_height - 4   # Lower
        ]
        
        self.wall_sensors = []
        for y in wall_y_positions:
            # Left wall sensors
            self.wall_sensors.append(Vector2D(self.position.x - half_width - self.wall_check_distance, y))
            # Right wall sensors
            self.wall_sensors.append(Vector2D(self.position.x + half_width + self.wall_check_distance, y))
    
    def update(self, dt: float, platforms: List['Platform']) -> None:
        """Update character physics"""
        # Update timers
        self.coyote_timer += dt
        self.jump_buffer_timer += dt
        self.wall_jump_timer += dt
        
        # Handle input
        self.handle_input(dt)
        
        # Apply gravity
        if not self.is_grounded:
            self.velocity.y += self.gravity * dt
            self.velocity.y = min(self.velocity.y, self.max_fall_speed)
        
        # Handle moving platform velocity
        if self.on_moving_platform:
            self.velocity += self.platform_velocity
        
        # Apply movement
        new_position = self.position + self.velocity * dt
        
        # Collision detection and response
        self.handle_collisions(new_position, platforms, dt)
        
        # Update collision boxes
        self.update_collision_boxes()
        
        # Update facing direction
        if abs(self.input_x) > 0.1:
            self.facing_right = self.input_x > 0
        
        # Reset platform velocity after applying it
        self.platform_velocity = Vector2D.zero()
    
    def handle_input(self, dt: float) -> None:
        """Handle character input"""
        # Horizontal movement
        if abs(self.input_x) > 0.1:
            # Accelerate in input direction
            target_speed = self.input_x * self.max_speed
            
            # Different acceleration based on state
            if self.is_grounded:
                accel = self.acceleration
            elif self.is_against_wall and self.input_x * (1 if self.facing_right else -1) < 0:
                accel = self.acceleration * 0.5  # Reduced air control away from wall
            else:
                accel = self.acceleration * 0.6  # Air control
            
            # Apply slope factor if on slope
            if self.is_on_slope:
                slope_factor = max(0.3, 1.0 - abs(self.slope_angle) / self.max_slope_angle)
                accel *= slope_factor
            
            # Smooth acceleration
            speed_diff = target_speed - self.velocity.x
            if abs(speed_diff) > accel * dt:
                self.velocity.x += math.copysign(accel * dt, speed_diff)
            else:
                self.velocity.x = target_speed
        else:
            # Decelerate when no input
            if abs(self.velocity.x) > 0:
                decel = self.deceleration if self.is_grounded else self.deceleration * 0.5
                
                if abs(self.velocity.x) > decel * dt:
                    self.velocity.x -= math.copysign(decel * dt, self.velocity.x)
                else:
                    self.velocity.x = 0
        
        # Jumping
        if self.jump_pressed:
            self.jump_buffer_timer = 0.0  # Reset jump buffer
            
            if self.can_jump():
                self.start_jump()
            elif self.can_wall_jump():
                self.start_wall_jump()
        
        # Variable jump height
        if self.is_jumping and self.jump_held:
            self.jump_time += dt
            if self.jump_time < self.max_jump_time:
                # Continue applying jump force for smoother arc
                jump_force = self.jump_strength * 0.2
                self.velocity.y -= jump_force * dt
        
        if not self.jump_held or self.jump_time >= self.max_jump_time:
            self.is_jumping = False
        
        # Wall sliding
        if self.is_against_wall and not self.is_grounded and self.velocity.y > 0:
            # Check if moving into wall
            wall_direction = 1 if self.facing_right else -1
            if self.input_x * wall_direction > 0:
                self.velocity.y = min(self.velocity.y, self.wall_slide_speed)
    
    def can_jump(self) -> bool:
        """Check if character can jump"""
        return (self.is_grounded or self.coyote_timer < self.coyote_time) and self.jump_buffer_timer < self.jump_buffer_time
    
    def can_wall_jump(self) -> bool:
        """Check if character can wall jump"""
        return (self.is_against_wall and not self.is_grounded and 
                self.wall_jump_timer > self.wall_jump_time and
                self.jump_buffer_timer < self.jump_buffer_time)
    
    def start_jump(self) -> None:
        """Start a normal jump"""
        self.velocity.y = -self.jump_strength
        self.is_jumping = True
        self.jump_time = 0.0
        self.is_grounded = False
        self.coyote_timer = self.coyote_time  # Prevent multiple jumps
    
    def start_wall_jump(self) -> None:
        """Start a wall jump"""
        # Wall jump pushes away from wall
        wall_direction = -1 if self.facing_right else 1
        self.velocity.x = self.wall_jump_force.x * wall_direction
        self.velocity.y = self.wall_jump_force.y
        
        self.is_jumping = True
        self.jump_time = 0.0
        self.wall_jump_timer = 0.0
        self.is_grounded = False
        self.is_against_wall = False
    
    def handle_collisions(self, new_position: Vector2D, platforms: List['Platform'], dt: float) -> None:
        """Handle collisions with platforms"""
        self.is_grounded = False
        self.is_on_slope = False
        self.is_against_wall = False
        self.on_moving_platform = None
        self.slope_angle = 0.0
        
        # Check each platform
        for platform in platforms:
            if self.check_platform_collision(new_position, platform, dt):
                pass  # Collision handled in check_platform_collision
        
        # Update grounded state based on ground sensors
        if not self.is_grounded:
            self.is_grounded = self.check_ground_sensors(platforms)
        
        # Update wall detection
        self.is_against_wall = self.check_wall_sensors(platforms)
        
        # Apply final position
        self.position = new_position
        
        # Reset coyote timer if grounded
        if self.is_grounded:
            self.coyote_timer = 0.0
    
    def check_platform_collision(self, new_position: Vector2D, platform: 'Platform', dt: float) -> bool:
        """Check collision with a specific platform"""
        # Create character AABB at new position
        half_width = self.size.x / 2
        half_height = self.size.y / 2
        
        char_min = Vector2D(new_position.x - half_width, new_position.y - half_height)
        char_max = Vector2D(new_position.x + half_width, new_position.y + half_height)
        
        # Check if AABBs overlap
        if (char_max.x < platform.position.x or char_min.x > platform.position.x + platform.size.x or
            char_max.y < platform.position.y or char_min.y > platform.position.y + platform.size.y):
            return False  # No collision
        
        # Determine collision type and resolve
        if platform.platform_type == PlatformType.SOLID:
            return self.resolve_solid_collision(new_position, platform)
        elif platform.platform_type == PlatformType.ONE_WAY:
            return self.resolve_one_way_collision(new_position, platform)
        elif platform.platform_type == PlatformType.SLOPE:
            return self.resolve_slope_collision(new_position, platform)
        elif platform.platform_type == PlatformType.MOVING:
            collision = self.resolve_solid_collision(new_position, platform)
            if collision and self.velocity.y >= 0:  # On top of platform
                self.on_moving_platform = platform
                self.platform_velocity = platform.velocity.copy()
            return collision
        
        return False
    
    def resolve_solid_collision(self, new_position: Vector2D, platform: 'Platform') -> bool:
        """Resolve collision with solid platform"""
        half_width = self.size.x / 2
        half_height = self.size.y / 2
        
        # Calculate overlap
        char_min = Vector2D(new_position.x - half_width, new_position.y - half_height)
        char_max = Vector2D(new_position.x + half_width, new_position.y + half_height)
        
        overlap_x = min(char_max.x, platform.position.x + platform.size.x) - max(char_min.x, platform.position.x)
        overlap_y = min(char_max.y, platform.position.y + platform.size.y) - max(char_min.y, platform.position.y)
        
        if overlap_x <= 0 or overlap_y <= 0:
            return False
        
        # Resolve collision based on smallest overlap
        if overlap_x < overlap_y:
            # Horizontal collision
            if new_position.x < platform.position.x + platform.size.x / 2:
                # Hit from left
                new_position.x = platform.position.x - half_width
            else:
                # Hit from right
                new_position.x = platform.position.x + platform.size.x + half_width
            
            self.velocity.x = 0
            self.is_against_wall = True
        else:
            # Vertical collision
            if new_position.y < platform.position.y + platform.size.y / 2:
                # Hit from above (landing on platform)
                new_position.y = platform.position.y - half_height
                self.velocity.y = max(0, self.velocity.y)  # Stop falling
                self.is_grounded = True
            else:
                # Hit from below (hitting ceiling)
                new_position.y = platform.position.y + platform.size.y + half_height
                self.velocity.y = min(0, self.velocity.y)  # Stop rising
        
        return True
    
    def resolve_one_way_collision(self, new_position: Vector2D, platform: 'Platform') -> bool:
        """Resolve collision with one-way platform (can only land on top)"""
        half_height = self.size.y / 2
        
        # Only check if falling and above platform
        if self.velocity.y <= 0:
            return False
        
        platform_top = platform.position.y
        char_bottom_old = self.position.y + half_height
        char_bottom_new = new_position.y + half_height
        
        # Check if crossing platform surface from above
        if char_bottom_old <= platform_top and char_bottom_new > platform_top:
            # Check horizontal overlap
            char_left = new_position.x - self.size.x / 2
            char_right = new_position.x + self.size.x / 2
            
            if char_right > platform.position.x and char_left < platform.position.x + platform.size.x:
                # Land on platform
                new_position.y = platform_top - half_height
                self.velocity.y = 0
                self.is_grounded = True
                return True
        
        return False
    
    def resolve_slope_collision(self, new_position: Vector2D, platform: 'Platform') -> bool:
        """Resolve collision with sloped platform"""
        # Simplified slope collision - assume platform defines slope angle
        # In a real implementation, you'd calculate this from platform geometry
        
        if not hasattr(platform, 'slope_angle'):
            return self.resolve_solid_collision(new_position, platform)
        
        slope_angle = platform.slope_angle
        
        # Check if slope is too steep
        if abs(slope_angle) > self.max_slope_angle:
            return self.resolve_solid_collision(new_position, platform)
        
        # Calculate slope position
        relative_x = new_position.x - platform.position.x
        
        if 0 <= relative_x <= platform.size.x:
            # On the slope
            slope_height = math.tan(slope_angle) * relative_x
            slope_y = platform.position.y + platform.size.y - slope_height
            
            char_bottom = new_position.y + self.size.y / 2
            
            if char_bottom >= slope_y - 2:  # Small tolerance
                # On slope
                new_position.y = slope_y - self.size.y / 2
                
                # Adjust velocity for slope
                if self.is_grounded:
                    # Project velocity onto slope
                    slope_normal = Vector2D(-math.sin(slope_angle), math.cos(slope_angle))
                    velocity_along_slope = self.velocity.dot(slope_normal)
                    self.velocity -= slope_normal * velocity_along_slope
                
                self.velocity.y = max(0, self.velocity.y)
                self.is_grounded = True
                self.is_on_slope = True
                self.slope_angle = slope_angle
                return True
        
        return False
    
    def check_ground_sensors(self, platforms: List['Platform']) -> bool:
        """Check ground sensors for platform detection"""
        for sensor_pos in self.ground_sensors:
            for platform in platforms:
                if (sensor_pos.x >= platform.position.x and 
                    sensor_pos.x <= platform.position.x + platform.size.x and
                    sensor_pos.y >= platform.position.y and
                    sensor_pos.y <= platform.position.y + platform.size.y):
                    return True
        return False
    
    def check_wall_sensors(self, platforms: List['Platform']) -> bool:
        """Check wall sensors for wall detection"""
        for i, sensor_pos in enumerate(self.wall_sensors):
            for platform in platforms:
                if (sensor_pos.x >= platform.position.x and 
                    sensor_pos.x <= platform.position.x + platform.size.x and
                    sensor_pos.y >= platform.position.y and
                    sensor_pos.y <= platform.position.y + platform.size.y):
                    
                    # Determine which side the wall is on
                    if i % 2 == 0:  # Left sensors
                        self.facing_right = False
                    else:  # Right sensors
                        self.facing_right = True
                    
                    return True
        return False
    
    def set_input(self, input_x: float, jump_pressed: bool, jump_held: bool) -> None:
        """Set character input"""
        self.input_x = clamp(input_x, -1.0, 1.0)
        self.jump_pressed = jump_pressed
        self.jump_held = jump_held


class PlatformType:
    """Platform type enumeration"""
    SOLID = "solid"
    ONE_WAY = "one_way"
    SLOPE = "slope"
    MOVING = "moving"
    ICE = "ice"
    BOUNCY = "bouncy"


class Platform:
    """
    Platform object for platformer physics
    """
    
    def __init__(self, position: Vector2D, size: Vector2D, platform_type: str = PlatformType.SOLID):
        self.position = position.copy()
        self.size = size.copy()
        self.platform_type = platform_type
        
        # Movement (for moving platforms)
        self.velocity = Vector2D.zero()
        self.move_path = []
        self.current_target = 0
        self.move_speed = 50.0
        self.wait_time = 0.0
        self.wait_duration = 1.0
        
        # Special properties
        self.friction = 1.0  # Normal friction
        self.bounce_factor = 1.0  # For bouncy platforms
        self.slope_angle = 0.0  # For slope platforms
        
        # Visual properties
        self.color = self.get_color_for_type()
        
    def get_color_for_type(self) -> Tuple[int, int, int]:
        """Get color based on platform type"""
        colors = {
            PlatformType.SOLID: (100, 100, 100),
            PlatformType.ONE_WAY: (150, 100, 50),
            PlatformType.SLOPE: (80, 120, 80),
            PlatformType.MOVING: (120, 80, 120),
            PlatformType.ICE: (150, 200, 255),
            PlatformType.BOUNCY: (255, 100, 100)
        }
        return colors.get(self.platform_type, (100, 100, 100))
    
    def update(self, dt: float) -> None:
        """Update platform (mainly for moving platforms)"""
        if self.platform_type == PlatformType.MOVING and self.move_path:
            if self.wait_time > 0:
                self.wait_time -= dt
            else:
                self.move_along_path(dt)
    
    def move_along_path(self, dt: float) -> None:
        """Move platform along its defined path"""
        if not self.move_path:
            return
        
        target_pos = self.move_path[self.current_target]
        direction = target_pos - self.position
        distance = direction.magnitude
        
        if distance < 5.0:  # Close enough to target
            self.position = target_pos.copy()
            self.velocity = Vector2D.zero()
            self.wait_time = self.wait_duration
            
            # Move to next target
            self.current_target = (self.current_target + 1) % len(self.move_path)
        else:
            # Move toward target
            self.velocity = direction.normalize() * self.move_speed
            self.position += self.velocity * dt
    
    def set_move_path(self, path_points: List[Vector2D], speed: float = 50.0, wait_duration: float = 1.0) -> None:
        """Set movement path for moving platform"""
        self.move_path = [point.copy() for point in path_points]
        self.move_speed = speed
        self.wait_duration = wait_duration
        self.current_target = 0
    
    def contains_point(self, point: Vector2D) -> bool:
        """Check if point is inside platform"""
        return (point.x >= self.position.x and point.x <= self.position.x + self.size.x and
                point.y >= self.position.y and point.y <= self.position.y + self.size.y)


class PlatformerWorld:
    """
    Complete platformer world with characters and platforms
    """
    
    def __init__(self, bounds: Vector2D = None):
        self.bounds = bounds if bounds else Vector2D(800, 600)
        self.platforms = []
        self.characters = []
        self.gravity = Vector2D(0, 1200)
        
        # World properties
        self.wind = Vector2D.zero()
        self.friction_multiplier = 1.0
        
        # Effects
        self.particle_effects = []
    
    def add_platform(self, platform: Platform) -> None:
        """Add platform to world"""
        self.platforms.append(platform)
    
    def add_character(self, character: PlatformerCharacter) -> None:
        """Add character to world"""
        self.characters.append(character)
    
    def update(self, dt: float) -> None:
        """Update entire platformer world"""
        # Update platforms
        for platform in self.platforms:
            platform.update(dt)
        
        # Update characters
        for character in self.characters:
            character.update(dt, self.platforms)
            
            # Apply world bounds
            self.apply_world_bounds(character)
        
        # Update particle effects
        self.update_particle_effects(dt)
    
    def apply_world_bounds(self, character: PlatformerCharacter) -> None:
        """Keep character within world bounds"""
        half_width = character.size.x / 2
        half_height = character.size.y / 2
        
        # Horizontal bounds
        if character.position.x - half_width < 0:
            character.position.x = half_width
            character.velocity.x = max(0, character.velocity.x)
        elif character.position.x + half_width > self.bounds.x:
            character.position.x = self.bounds.x - half_width
            character.velocity.x = min(0, character.velocity.x)
        
        # Vertical bounds (usually just bottom)
        if character.position.y + half_height > self.bounds.y:
            character.position.y = self.bounds.y - half_height
            character.velocity.y = 0
            character.is_grounded = True
    
    def update_particle_effects(self, dt: float) -> None:
        """Update particle effects (dust, etc.)"""
        # Placeholder for particle effects
        pass
    
    def create_test_level(self) -> None:
        """Create a test level with various platform types"""
        # Ground platforms
        self.add_platform(Platform(Vector2D(0, 550), Vector2D(200, 50), PlatformType.SOLID))
        self.add_platform(Platform(Vector2D(300, 550), Vector2D(200, 50), PlatformType.SOLID))
        self.add_platform(Platform(Vector2D(600, 550), Vector2D(200, 50), PlatformType.SOLID))
        
        # Elevated platforms
        self.add_platform(Platform(Vector2D(150, 450), Vector2D(100, 20), PlatformType.ONE_WAY))
        self.add_platform(Platform(Vector2D(350, 400), Vector2D(100, 20), PlatformType.ONE_WAY))
        self.add_platform(Platform(Vector2D(550, 350), Vector2D(100, 20), PlatformType.ONE_WAY))
        
        # Moving platform
        moving_platform = Platform(Vector2D(100, 300), Vector2D(80, 20), PlatformType.MOVING)
        moving_platform.set_move_path([
            Vector2D(100, 300),
            Vector2D(300, 300),
            Vector2D(500, 250)
        ], speed=60.0, wait_duration=2.0)
        self.add_platform(moving_platform)
        
        # Slope platform
        slope = Platform(Vector2D(400, 500), Vector2D(150, 30), PlatformType.SLOPE)
        slope.slope_angle = math.pi / 6  # 30 degree slope
        self.add_platform(slope)
        
        # Walls
        self.add_platform(Platform(Vector2D(-10, 0), Vector2D(10, 600), PlatformType.SOLID))
        self.add_platform(Platform(Vector2D(800, 0), Vector2D(10, 600), PlatformType.SOLID))
    
    def get_platform_at_point(self, point: Vector2D) -> Optional[Platform]:
        """Get platform at specific point"""
        for platform in self.platforms:
            if platform.contains_point(point):
                return platform
        return None

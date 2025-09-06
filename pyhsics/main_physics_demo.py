"""
Main Physics Engine Demo
Comprehensive 2D physics simulation demonstrating all implemented systems with interactive controls
"""

import pygame
import sys
import math
import random
from typing import Dict, List, Tuple, Optional

# Import all physics modules
from vector2d import Vector2D
from physics_body import PhysicsBody
from collision_detection import CollisionDetector, SpatialHash
from collision_resolution import CollisionResolver, ConstraintSolver, SpringJoint, DistanceJoint
from particle_system import FluidSystem, Particle
from soft_body_physics import SoftBody, RagdollSystem, MassPoint
from specialized_physics import OrbitalMechanicsSystem, OrbitingBody, ProjectileSystem, Projectile, Vehicle
from platformer_physics import PlatformerWorld, PlatformerCharacter, Platform, PlatformType


class SimulationMode:
    """Enumeration of simulation modes"""
    BASIC_PHYSICS = "Basic Physics"
    FLUID_DYNAMICS = "Fluid Dynamics" 
    SOFT_BODY = "Soft Body Physics"
    RAGDOLL = "Ragdoll Physics"
    ORBITAL_MECHANICS = "Orbital Mechanics"
    PROJECTILE_MOTION = "Projectile Motion"
    VEHICLE_PHYSICS = "Vehicle Physics"
    PLATFORMER = "Platformer Physics"


class PhysicsDemo:
    """
    Main physics demonstration application
    """
    
    def __init__(self, width: int = 1200, height: int = 800):
        # Initialize Pygame
        pygame.init()
        
        self.width = width
        self.height = height
        self.screen = pygame.display.set_mode((width, height))
        pygame.display.set_caption("Advanced 2D Physics Engine Demo")
        
        # Fonts for UI
        self.font = pygame.font.Font(None, 24)
        self.small_font = pygame.font.Font(None, 18)
        self.large_font = pygame.font.Font(None, 32)
        
        # Simulation state
        self.clock = pygame.time.Clock()
        self.running = True
        self.paused = False
        self.simulation_speed = 1.0
        self.show_debug_info = True
        self.show_trails = True
        
        # Current simulation mode
        self.current_mode = SimulationMode.BASIC_PHYSICS
        self.mode_index = 0
        self.available_modes = [
            SimulationMode.BASIC_PHYSICS,
            SimulationMode.FLUID_DYNAMICS,
            SimulationMode.SOFT_BODY,
            SimulationMode.RAGDOLL,
            SimulationMode.ORBITAL_MECHANICS,
            SimulationMode.PROJECTILE_MOTION,
            SimulationMode.VEHICLE_PHYSICS,
            SimulationMode.PLATFORMER
        ]
        
        # Initialize all physics systems
        self.init_physics_systems()
        
        # User interaction
        self.mouse_pos = Vector2D(0, 0)
        self.mouse_pressed = False
        self.keys_pressed = set()
        
        # Demo parameters (adjustable via UI)
        self.gravity_strength = 9.81 * 100  # Scaled for pixels
        self.air_density = 1.225
        self.wind_force = Vector2D.zero()
        self.time_scale = 1.0
        
        # Performance tracking
        self.frame_count = 0
        self.fps = 0
        self.physics_time = 0
        self.render_time = 0
        
        # Initialize first simulation
        self.setup_simulation()
    
    def init_physics_systems(self):
        """Initialize all physics systems"""
        # Basic physics
        self.collision_detector = CollisionDetector()
        self.collision_resolver = CollisionResolver()
        self.constraint_solver = ConstraintSolver()
        self.spatial_hash = SpatialHash()
        self.physics_bodies = []
        
        # Fluid dynamics
        self.fluid_system = FluidSystem(
            smoothing_radius=20.0,
            rest_density=1000.0,
            gas_constant=2000.0,
            viscosity=250.0,
            surface_tension=0.0728,
            gravity=Vector2D(0, self.gravity_strength)
        )
        
        # Soft body physics
        self.soft_bodies = []
        
        # Ragdoll physics
        self.ragdoll_systems = []
        
        # Orbital mechanics
        self.orbital_system = OrbitalMechanicsSystem()
        
        # Projectile system
        self.projectile_system = ProjectileSystem(
            gravity=Vector2D(0, self.gravity_strength),
            air_density=self.air_density
        )
        
        # Vehicle physics
        self.vehicles = []
        
        # Platformer physics
        self.platformer_world = PlatformerWorld(Vector2D(self.width, self.height))
    
    def setup_simulation(self):
        """Setup simulation based on current mode"""
        # Clear all systems
        self.physics_bodies.clear()
        self.soft_bodies.clear()
        self.ragdoll_systems.clear()
        self.vehicles.clear()
        self.fluid_system.particles.clear()
        self.orbital_system.bodies.clear()
        self.projectile_system.projectiles.clear()
        self.platformer_world.platforms.clear()
        self.platformer_world.characters.clear()
        
        if self.current_mode == SimulationMode.BASIC_PHYSICS:
            self.setup_basic_physics()
        elif self.current_mode == SimulationMode.FLUID_DYNAMICS:
            self.setup_fluid_dynamics()
        elif self.current_mode == SimulationMode.SOFT_BODY:
            self.setup_soft_body()
        elif self.current_mode == SimulationMode.RAGDOLL:
            self.setup_ragdoll()
        elif self.current_mode == SimulationMode.ORBITAL_MECHANICS:
            self.setup_orbital_mechanics()
        elif self.current_mode == SimulationMode.PROJECTILE_MOTION:
            self.setup_projectile_motion()
        elif self.current_mode == SimulationMode.VEHICLE_PHYSICS:
            self.setup_vehicle_physics()
        elif self.current_mode == SimulationMode.PLATFORMER:
            self.setup_platformer()
    
    def setup_basic_physics(self):
        """Setup basic physics demonstration with various objects"""
        # Create different types of objects
        for i in range(15):
            x = random.uniform(100, self.width - 100)
            y = random.uniform(50, 200)
            
            if i < 5:  # Circles
                body = PhysicsBody(
                    position=Vector2D(x, y),
                    velocity=Vector2D(random.uniform(-50, 50), 0),
                    mass=random.uniform(0.5, 2.0),
                    radius=random.uniform(8, 20),
                    restitution=random.uniform(0.3, 0.9),
                    body_type="circle"
                )
                body.color = (random.randint(100, 255), random.randint(100, 255), random.randint(100, 255))
            else:  # Polygons
                # Create random polygon
                vertices = []
                num_sides = random.randint(3, 6)
                radius = random.uniform(10, 25)
                for j in range(num_sides):
                    angle = (j / num_sides) * 2 * math.pi
                    vertex = Vector2D(radius * math.cos(angle), radius * math.sin(angle))
                    vertices.append(vertex)
                
                body = PhysicsBody(
                    position=Vector2D(x, y),
                    velocity=Vector2D(random.uniform(-30, 30), 0),
                    mass=random.uniform(0.8, 2.5),
                    restitution=random.uniform(0.2, 0.8),
                    body_type="polygon"
                )
                body.set_polygon_vertices(vertices)
                body.color = (random.randint(150, 255), random.randint(50, 200), random.randint(50, 200))
            
            self.physics_bodies.append(body)
        
        # Add some static platforms
        platform1 = PhysicsBody(
            position=Vector2D(200, self.height - 100),
            mass=1000,
            radius=100,
            is_static=True,
            body_type="circle"
        )
        platform1.color = (100, 100, 100)
        self.physics_bodies.append(platform1)
        
        platform2 = PhysicsBody(
            position=Vector2D(600, self.height - 150),
            mass=1000,
            is_static=True,
            body_type="polygon"
        )
        platform2.set_polygon_vertices([
            Vector2D(-80, -20), Vector2D(80, -20), Vector2D(80, 20), Vector2D(-80, 20)
        ])
        platform2.color = (80, 80, 80)
        self.physics_bodies.append(platform2)
    
    def setup_fluid_dynamics(self):
        """Setup fluid dynamics demonstration"""
        # Create fluid blocks
        self.fluid_system.create_fluid_block(
            Vector2D(100, 300), width=20, height=15, spacing=4.0
        )
        
        self.fluid_system.create_fluid_block(
            Vector2D(400, 200), width=15, height=10, spacing=4.0,
            initial_velocity=Vector2D(50, 0)
        )
        
        # Add solid bodies for interaction
        solid1 = PhysicsBody(
            position=Vector2D(300, 400),
            mass=10.0,
            radius=30,
            is_static=True,
            body_type="circle"
        )
        solid1.density = 500  # Less dense than water for buoyancy
        self.fluid_system.add_solid_body(solid1)
        
        solid2 = PhysicsBody(
            position=Vector2D(500, 350),
            mass=5.0,
            is_static=True,
            body_type="polygon"
        )
        solid2.set_polygon_vertices([
            Vector2D(-25, -25), Vector2D(25, -25), Vector2D(25, 25), Vector2D(-25, 25)
        ])
        solid2.density = 2000  # Denser than water
        self.fluid_system.add_solid_body(solid2)
    
    def setup_soft_body(self):
        """Setup soft body physics demonstration"""
        # Create various soft bodies
        soft_body1 = SoftBody(
            center=Vector2D(200, 200),
            width=80,
            height=60,
            resolution=6,
            stiffness=800.0,
            damping=20.0
        )
        self.soft_bodies.append(soft_body1)
        
        soft_body2 = SoftBody(
            center=Vector2D(400, 150),
            width=60,
            height=80,
            resolution=5,
            stiffness=1200.0,
            damping=15.0
        )
        # Pin top corners
        soft_body2.pin_point(0)  # Top-left
        soft_body2.pin_point(4)  # Top-right
        self.soft_bodies.append(soft_body2)
        
        # Add some static objects to interact with
        obstacle = PhysicsBody(
            position=Vector2D(300, 400),
            mass=1000,
            radius=40,
            is_static=True,
            body_type="circle"
        )
        obstacle.color = (100, 100, 100)
        self.physics_bodies.append(obstacle)
    
    def setup_ragdoll(self):
        """Setup ragdoll physics demonstration"""
        # Create multiple ragdolls
        ragdoll1 = RagdollSystem(Vector2D(200, 200))
        self.ragdoll_systems.append(ragdoll1)
        
        ragdoll2 = RagdollSystem(Vector2D(400, 150))
        self.ragdoll_systems.append(ragdoll2)
        
        # Add ground
        ground = PhysicsBody(
            position=Vector2D(self.width/2, self.height - 30),
            mass=1000,
            is_static=True,
            body_type="polygon"
        )
        ground.set_polygon_vertices([
            Vector2D(-self.width/2, -30), Vector2D(self.width/2, -30),
            Vector2D(self.width/2, 30), Vector2D(-self.width/2, 30)
        ])
        ground.color = (80, 80, 80)
        self.physics_bodies.append(ground)
    
    def setup_orbital_mechanics(self):
        """Setup orbital mechanics demonstration"""
        # Create central body (star/planet)
        central_body = OrbitingBody(
            position=Vector2D(self.width/2, self.height/2),
            velocity=Vector2D.zero(),
            mass=1000000,
            radius=40,
            is_central_body=True
        )
        central_body.color = (255, 255, 100)  # Yellow star
        self.orbital_system.add_body(central_body)
        
        # Create orbiting bodies
        distances = [120, 180, 250, 320, 400]
        masses = [1.0, 1.5, 2.0, 0.8, 1.2]
        colors = [(255, 100, 100), (100, 255, 100), (100, 100, 255), (255, 150, 100), (150, 100, 255)]
        
        for i, (distance, mass, color) in enumerate(zip(distances, masses, colors)):
            angle = i * (2 * math.pi / len(distances))
            orbiting_body = self.orbital_system.create_circular_orbit(
                central_body, distance, mass, angle
            )
            orbiting_body.color = color
            orbiting_body.radius = 8 + mass * 3
        
        # Create one elliptical orbit
        elliptical_body = self.orbital_system.create_elliptical_orbit(
            central_body, periapsis=100, apoapsis=300, orbital_mass=1.5, angle=math.pi/4
        )
        elliptical_body.color = (255, 255, 255)
        elliptical_body.radius = 10
        
        # Set time scale for interesting orbital motion
        self.orbital_system.time_scale = 0.5
    
    def setup_projectile_motion(self):
        """Setup projectile motion demonstration"""
        # Add some obstacles
        obstacles = [
            PhysicsBody(Vector2D(300, 500), mass=1000, radius=30, is_static=True),
            PhysicsBody(Vector2D(500, 400), mass=1000, radius=25, is_static=True),
            PhysicsBody(Vector2D(700, 450), mass=1000, radius=35, is_static=True)
        ]
        
        for obstacle in obstacles:
            obstacle.color = (100, 100, 100)
            self.projectile_system.obstacles.append(obstacle)
        
        # Add gravity wells
        self.projectile_system.add_gravity_well(Vector2D(400, 300), 50000, 100)
        self.projectile_system.add_gravity_well(Vector2D(600, 200), -30000, 80)  # Anti-gravity well
        
        # Set wind
        self.projectile_system.set_wind(Vector2D(20, 0))
    
    def setup_vehicle_physics(self):
        """Setup vehicle physics demonstration"""
        # Create vehicle
        vehicle = Vehicle(Vector2D(200, self.height - 100), mass=1200.0)
        self.vehicles.append(vehicle)
        
        # Create track boundaries
        track_boundaries = [
            # Outer boundary
            PhysicsBody(Vector2D(50, self.height/2), mass=1000, is_static=True, body_type="polygon"),
            PhysicsBody(Vector2D(self.width - 50, self.height/2), mass=1000, is_static=True, body_type="polygon"),
            PhysicsBody(Vector2D(self.width/2, 100), mass=1000, is_static=True, body_type="polygon"),
            PhysicsBody(Vector2D(self.width/2, self.height - 50), mass=1000, is_static=True, body_type="polygon")
        ]
        
        # Set up boundary shapes
        for i, boundary in enumerate(track_boundaries):
            if i < 2:  # Side boundaries
                boundary.set_polygon_vertices([
                    Vector2D(-20, -self.height/2), Vector2D(20, -self.height/2),
                    Vector2D(20, self.height/2), Vector2D(-20, self.height/2)
                ])
            else:  # Top/bottom boundaries
                boundary.set_polygon_vertices([
                    Vector2D(-self.width/2, -20), Vector2D(self.width/2, -20),
                    Vector2D(self.width/2, 20), Vector2D(-self.width/2, 20)
                ])
            boundary.color = (100, 100, 100)
            self.physics_bodies.append(boundary)
    
    def setup_platformer(self):
        """Setup platformer physics demonstration"""
        self.platformer_world.create_test_level()
        
        # Add character
        character = PlatformerCharacter(Vector2D(100, 400))
        self.platformer_world.add_character(character)
    
    def handle_events(self):
        """Handle pygame events"""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            
            elif event.type == pygame.KEYDOWN:
                self.keys_pressed.add(event.key)
                
                if event.key == pygame.K_SPACE:
                    self.paused = not self.paused
                elif event.key == pygame.K_r:
                    self.setup_simulation()
                elif event.key == pygame.K_LEFT:
                    self.mode_index = (self.mode_index - 1) % len(self.available_modes)
                    self.current_mode = self.available_modes[self.mode_index]
                    self.setup_simulation()
                elif event.key == pygame.K_RIGHT:
                    self.mode_index = (self.mode_index + 1) % len(self.available_modes)
                    self.current_mode = self.available_modes[self.mode_index]
                    self.setup_simulation()
                elif event.key == pygame.K_d:
                    self.show_debug_info = not self.show_debug_info
                elif event.key == pygame.K_t:
                    self.show_trails = not self.show_trails
                elif event.key == pygame.K_PLUS or event.key == pygame.K_EQUALS:
                    self.simulation_speed = min(3.0, self.simulation_speed + 0.1)
                elif event.key == pygame.K_MINUS:
                    self.simulation_speed = max(0.1, self.simulation_speed - 0.1)
            
            elif event.type == pygame.KEYUP:
                self.keys_pressed.discard(event.key)
            
            elif event.type == pygame.MOUSEBUTTONDOWN:
                self.mouse_pressed = True
                self.handle_mouse_interaction()
            
            elif event.type == pygame.MOUSEBUTTONUP:
                self.mouse_pressed = False
            
            elif event.type == pygame.MOUSEMOTION:
                self.mouse_pos = Vector2D(event.pos[0], event.pos[1])
    
    def handle_mouse_interaction(self):
        """Handle mouse interactions for creating objects or applying forces"""
        if self.current_mode == SimulationMode.BASIC_PHYSICS:
            # Add new physics body
            body = PhysicsBody(
                position=self.mouse_pos.copy(),
                velocity=Vector2D(random.uniform(-100, 100), random.uniform(-50, 0)),
                mass=random.uniform(0.5, 2.0),
                radius=random.uniform(8, 20),
                restitution=random.uniform(0.3, 0.9),
                body_type="circle"
            )
            body.color = (random.randint(100, 255), random.randint(100, 255), random.randint(100, 255))
            self.physics_bodies.append(body)
        
        elif self.current_mode == SimulationMode.FLUID_DYNAMICS:
            # Add fluid emitter
            self.fluid_system.create_fluid_emitter(
                self.mouse_pos, 
                Vector2D(random.uniform(-1, 1), -1).normalize(),
                rate=5.0,
                speed=100.0
            )
        
        elif self.current_mode == SimulationMode.RAGDOLL:
            # Apply impulse to ragdolls
            impulse = Vector2D(random.uniform(-500, 500), random.uniform(-300, -100))
            for ragdoll in self.ragdoll_systems:
                ragdoll.apply_impulse_at_point(self.mouse_pos, impulse)
        
        elif self.current_mode == SimulationMode.PROJECTILE_MOTION:
            # Launch projectile
            launch_velocity = Vector2D(
                random.uniform(-200, 200),
                random.uniform(-400, -200)
            )
            self.projectile_system.launch_projectile(
                self.mouse_pos.copy(),
                launch_velocity,
                mass=random.uniform(0.5, 2.0),
                drag_coefficient=random.uniform(0.2, 0.8)
            )
    
    def update_physics(self, dt: float):
        """Update physics simulation"""
        if self.paused:
            return
        
        dt *= self.simulation_speed
        
        if self.current_mode == SimulationMode.BASIC_PHYSICS:
            self.update_basic_physics(dt)
        elif self.current_mode == SimulationMode.FLUID_DYNAMICS:
            self.fluid_system.update(dt)
        elif self.current_mode == SimulationMode.SOFT_BODY:
            for soft_body in self.soft_bodies:
                soft_body.update(dt)
        elif self.current_mode == SimulationMode.RAGDOLL:
            for ragdoll in self.ragdoll_systems:
                ragdoll.update(dt)
        elif self.current_mode == SimulationMode.ORBITAL_MECHANICS:
            self.orbital_system.update(dt)
        elif self.current_mode == SimulationMode.PROJECTILE_MOTION:
            self.projectile_system.update(dt)
        elif self.current_mode == SimulationMode.VEHICLE_PHYSICS:
            self.update_vehicle_physics(dt)
        elif self.current_mode == SimulationMode.PLATFORMER:
            self.update_platformer_input()
            self.platformer_world.update(dt)
    
    def update_basic_physics(self, dt: float):
        """Update basic physics simulation"""
        # Apply gravity
        gravity = Vector2D(0, self.gravity_strength)
        for body in self.physics_bodies:
            if not body.is_static:
                body.apply_force(gravity * body.mass)
        
        # Rebuild spatial hash
        self.spatial_hash.rebuild(self.physics_bodies)
        
        # Detect and resolve collisions
        collision_pairs = self.spatial_hash.get_potential_collisions()
        for body_a, body_b in collision_pairs:
            manifold = self.collision_detector.detect_collision(body_a, body_b)
            if manifold:
                self.collision_resolver.resolve_collision(manifold)
        
        # Integrate physics
        for body in self.physics_bodies:
            body.integrate_forces(dt)
            body.integrate_velocity(dt)
            body.clear_forces()
        
        # Solve constraints
        self.constraint_solver.solve_constraints(dt)
    
    def update_vehicle_physics(self, dt: float):
        """Update vehicle physics with input"""
        if self.vehicles:
            vehicle = self.vehicles[0]
            
            # Handle input
            throttle = 1.0 if pygame.K_w in self.keys_pressed else 0.0
            brake = 1.0 if pygame.K_s in self.keys_pressed else 0.0
            steering = 0.0
            if pygame.K_a in self.keys_pressed:
                steering = -1.0
            elif pygame.K_d in self.keys_pressed:
                steering = 1.0
            
            vehicle.set_input(throttle, brake, steering)
            vehicle.update(dt)
    
    def update_platformer_input(self):
        """Update platformer character input"""
        if self.platformer_world.characters:
            character = self.platformer_world.characters[0]
            
            input_x = 0.0
            if pygame.K_a in self.keys_pressed or pygame.K_LEFT in self.keys_pressed:
                input_x = -1.0
            elif pygame.K_d in self.keys_pressed or pygame.K_RIGHT in self.keys_pressed:
                input_x = 1.0
            
            jump_pressed = pygame.K_SPACE in self.keys_pressed or pygame.K_w in self.keys_pressed or pygame.K_UP in self.keys_pressed
            jump_held = jump_pressed
            
            character.set_input(input_x, jump_pressed, jump_held)
    
    def render(self):
        """Render the simulation"""
        self.screen.fill((20, 20, 30))  # Dark blue background
        
        # Render based on current mode
        if self.current_mode == SimulationMode.BASIC_PHYSICS:
            self.render_basic_physics()
        elif self.current_mode == SimulationMode.FLUID_DYNAMICS:
            self.render_fluid_dynamics()
        elif self.current_mode == SimulationMode.SOFT_BODY:
            self.render_soft_body()
        elif self.current_mode == SimulationMode.RAGDOLL:
            self.render_ragdoll()
        elif self.current_mode == SimulationMode.ORBITAL_MECHANICS:
            self.render_orbital_mechanics()
        elif self.current_mode == SimulationMode.PROJECTILE_MOTION:
            self.render_projectile_motion()
        elif self.current_mode == SimulationMode.VEHICLE_PHYSICS:
            self.render_vehicle_physics()
        elif self.current_mode == SimulationMode.PLATFORMER:
            self.render_platformer()
        
        # Render UI
        self.render_ui()
        
        pygame.display.flip()
    
    def render_basic_physics(self):
        """Render basic physics objects"""
        for body in self.physics_bodies:
            if self.show_trails and body.trail_points:
                self.draw_trail(body.trail_points, body.color)
            
            if body.body_type == "circle":
                pygame.draw.circle(self.screen, body.color, 
                                 body.position.to_int_tuple(), int(body.radius))
                if self.show_debug_info:
                    pygame.draw.circle(self.screen, (255, 255, 255), 
                                     body.position.to_int_tuple(), int(body.radius), 1)
            elif body.body_type == "polygon" and body.vertices:
                points = [v.to_int_tuple() for v in body.vertices]
                pygame.draw.polygon(self.screen, body.color, points)
                if self.show_debug_info:
                    pygame.draw.polygon(self.screen, (255, 255, 255), points, 1)
    
    def render_fluid_dynamics(self):
        """Render fluid particles"""
        for particle in self.fluid_system.particles:
            if particle.is_active:
                color = tuple(particle.color + [particle.alpha])
                pygame.draw.circle(self.screen, particle.color[:3], 
                                 particle.position.to_int_tuple(), int(particle.radius))
                
                if self.show_trails and particle.trail_points:
                    self.draw_trail(particle.trail_points, particle.color[:3], alpha=100)
        
        # Render solid bodies
        for body in self.fluid_system.solid_bodies:
            if body.body_type == "circle":
                pygame.draw.circle(self.screen, (100, 100, 100), 
                                 body.position.to_int_tuple(), int(body.radius))
            elif body.body_type == "polygon" and body.vertices:
                points = [v.to_int_tuple() for v in body.vertices]
                pygame.draw.polygon(self.screen, (100, 100, 100), points)
    
    def render_soft_body(self):
        """Render soft bodies"""
        for soft_body in self.soft_bodies:
            # Draw springs
            if soft_body.show_structure:
                for spring in soft_body.springs:
                    if not spring.is_broken:
                        start = spring.point_a.position.to_int_tuple()
                        end = spring.point_b.position.to_int_tuple()
                        pygame.draw.line(self.screen, spring.color, start, end, 1)
            
            # Draw mass points
            for point in soft_body.mass_points:
                pygame.draw.circle(self.screen, point.color, 
                                 point.position.to_int_tuple(), int(point.radius))
        
        # Render static obstacles
        for body in self.physics_bodies:
            if body.body_type == "circle":
                pygame.draw.circle(self.screen, body.color, 
                                 body.position.to_int_tuple(), int(body.radius))
    
    def render_ragdoll(self):
        """Render ragdoll systems"""
        for ragdoll in self.ragdoll_systems:
            # Draw bones
            for bone in ragdoll.bones:
                start = bone.start.to_int_tuple()
                end = bone.end.to_int_tuple()
                pygame.draw.line(self.screen, bone.color, start, end, int(bone.thickness))
                
                # Draw joints
                pygame.draw.circle(self.screen, (255, 255, 255), start, 3)
                pygame.draw.circle(self.screen, (255, 255, 255), end, 3)
        
        # Render ground
        for body in self.physics_bodies:
            if body.body_type == "polygon" and body.vertices:
                points = [v.to_int_tuple() for v in body.vertices]
                pygame.draw.polygon(self.screen, body.color, points)
    
    def render_orbital_mechanics(self):
        """Render orbital mechanics simulation"""
        for body in self.orbital_system.bodies:
            # Draw trails
            if self.show_trails and body.trail_points:
                self.draw_trail(body.trail_points, body.color)
            
            # Draw body
            pygame.draw.circle(self.screen, body.color, 
                             body.position.to_int_tuple(), int(body.radius))
            
            # Draw orbital parameters if debug mode
            if self.show_debug_info and not body.is_central_body:
                # Draw velocity vector
                vel_end = body.position + body.velocity.normalize() * 30
                pygame.draw.line(self.screen, (0, 255, 0), 
                               body.position.to_int_tuple(), vel_end.to_int_tuple(), 2)
    
    def render_projectile_motion(self):
        """Render projectiles and environment"""
        # Draw gravity wells
        for well_pos, strength, radius in self.projectile_system.gravity_wells:
            color = (0, 255, 0) if strength > 0 else (255, 0, 0)
            pygame.draw.circle(self.screen, color, well_pos.to_int_tuple(), int(radius), 2)
        
        # Draw obstacles
        for obstacle in self.projectile_system.obstacles:
            pygame.draw.circle(self.screen, (100, 100, 100), 
                             obstacle.position.to_int_tuple(), int(obstacle.radius))
        
        # Draw projectiles
        for projectile in self.projectile_system.projectiles:
            if projectile.is_active:
                pygame.draw.circle(self.screen, projectile.color, 
                                 projectile.position.to_int_tuple(), int(projectile.radius))
                
                if self.show_trails and projectile.trail_points:
                    self.draw_trail(projectile.trail_points, projectile.color)
        
        # Draw ground
        pygame.draw.line(self.screen, (100, 100, 100), 
                        (0, self.projectile_system.ground_level), 
                        (self.width, self.projectile_system.ground_level), 3)
    
    def render_vehicle_physics(self):
        """Render vehicles"""
        for vehicle in self.vehicles:
            # Draw vehicle body
            corners = [
                Vector2D(-vehicle.width/2, -vehicle.height/2),
                Vector2D(vehicle.width/2, -vehicle.height/2),
                Vector2D(vehicle.width/2, vehicle.height/2),
                Vector2D(-vehicle.width/2, vehicle.height/2)
            ]
            
            # Transform corners
            cos_a = math.cos(vehicle.angle)
            sin_a = math.sin(vehicle.angle)
            world_corners = []
            for corner in corners:
                rotated_x = corner.x * cos_a - corner.y * sin_a
                rotated_y = corner.x * sin_a + corner.y * cos_a
                world_corner = vehicle.position + Vector2D(rotated_x, rotated_y)
                world_corners.append(world_corner.to_int_tuple())
            
            pygame.draw.polygon(self.screen, vehicle.color, world_corners)
            
            # Draw wheels
            for wheel in vehicle.wheels:
                pygame.draw.circle(self.screen, wheel.color, 
                                 wheel.world_position.to_int_tuple(), int(wheel.radius))
            
            # Draw trail
            if self.show_trails and vehicle.trail_points:
                self.draw_trail(vehicle.trail_points, vehicle.color)
        
        # Draw boundaries
        for body in self.physics_bodies:
            if body.body_type == "polygon" and body.vertices:
                points = [v.to_int_tuple() for v in body.vertices]
                pygame.draw.polygon(self.screen, body.color, points)
    
    def render_platformer(self):
        """Render platformer world"""
        # Draw platforms
        for platform in self.platformer_world.platforms:
            rect = pygame.Rect(platform.position.x, platform.position.y, 
                             platform.size.x, platform.size.y)
            pygame.draw.rect(self.screen, platform.color, rect)
            
            if platform.platform_type == PlatformType.ONE_WAY:
                # Draw arrow to indicate one-way
                center_x = platform.position.x + platform.size.x / 2
                arrow_y = platform.position.y - 5
                pygame.draw.polygon(self.screen, (255, 255, 255), [
                    (center_x - 5, arrow_y),
                    (center_x + 5, arrow_y),
                    (center_x, arrow_y - 5)
                ])
        
        # Draw characters
        for character in self.platformer_world.characters:
            rect = pygame.Rect(
                character.position.x - character.size.x / 2,
                character.position.y - character.size.y / 2,
                character.size.x,
                character.size.y
            )
            pygame.draw.rect(self.screen, character.color, rect)
            
            # Draw sensors if debug mode
            if self.show_debug_info:
                # Ground sensors
                for sensor in character.ground_sensors:
                    pygame.draw.circle(self.screen, (0, 255, 0), sensor.to_int_tuple(), 2)
                
                # Wall sensors
                for sensor in character.wall_sensors:
                    pygame.draw.circle(self.screen, (255, 0, 0), sensor.to_int_tuple(), 2)
    
    def draw_trail(self, trail_points: List[Vector2D], color: Tuple[int, int, int], alpha: int = 150):
        """Draw a trail of points"""
        if len(trail_points) < 2:
            return
        
        for i in range(len(trail_points) - 1):
            start_pos = trail_points[i].to_int_tuple()
            end_pos = trail_points[i + 1].to_int_tuple()
            
            # Fade trail
            trail_alpha = int(alpha * (i + 1) / len(trail_points))
            trail_color = (*color, trail_alpha)
            
            pygame.draw.line(self.screen, color, start_pos, end_pos, 2)
    
    def render_ui(self):
        """Render user interface"""
        # Mode information
        mode_text = self.large_font.render(f"Mode: {self.current_mode}", True, (255, 255, 255))
        self.screen.blit(mode_text, (10, 10))
        
        # Instructions
        instructions = [
            "LEFT/RIGHT: Change simulation mode",
            "SPACE: Pause/Resume",
            "R: Reset simulation",
            "Mouse Click: Interact",
            "+/-: Change speed",
            "D: Toggle debug info",
            "T: Toggle trails"
        ]
        
        if self.current_mode == SimulationMode.VEHICLE_PHYSICS:
            instructions.extend([
                "W: Throttle",
                "S: Brake", 
                "A/D: Steering"
            ])
        elif self.current_mode == SimulationMode.PLATFORMER:
            instructions.extend([
                "A/D or Arrow Keys: Move",
                "W/SPACE/Up: Jump"
            ])
        
        for i, instruction in enumerate(instructions):
            text = self.small_font.render(instruction, True, (200, 200, 200))
            self.screen.blit(text, (10, 50 + i * 20))
        
        # Performance info
        if self.show_debug_info:
            fps_text = self.font.render(f"FPS: {self.fps:.1f}", True, (255, 255, 255))
            speed_text = self.font.render(f"Speed: {self.simulation_speed:.1f}x", True, (255, 255, 255))
            paused_text = self.font.render("PAUSED" if self.paused else "RUNNING", True, 
                                         (255, 255, 0) if self.paused else (0, 255, 0))
            
            self.screen.blit(fps_text, (self.width - 100, 10))
            self.screen.blit(speed_text, (self.width - 100, 35))
            self.screen.blit(paused_text, (self.width - 100, 60))
            
            # Simulation-specific info
            if self.current_mode == SimulationMode.FLUID_DYNAMICS:
                particle_count = self.fluid_system.get_particle_count()
                count_text = self.font.render(f"Particles: {particle_count}", True, (255, 255, 255))
                self.screen.blit(count_text, (self.width - 150, 85))
            
            elif self.current_mode == SimulationMode.PROJECTILE_MOTION:
                projectile_count = len([p for p in self.projectile_system.projectiles if p.is_active])
                count_text = self.font.render(f"Projectiles: {projectile_count}", True, (255, 255, 255))
                self.screen.blit(count_text, (self.width - 150, 85))
    
    def run(self):
        """Main game loop"""
        while self.running:
            dt = self.clock.tick(60) / 1000.0  # 60 FPS, convert to seconds
            
            # Track performance
            self.frame_count += 1
            if self.frame_count % 60 == 0:  # Update FPS every second
                self.fps = self.clock.get_fps()
            
            # Handle events
            self.handle_events()
            
            # Update physics
            import time
            physics_start = time.time()
            self.update_physics(dt)
            self.physics_time = time.time() - physics_start
            
            # Render
            render_start = time.time()
            self.render()
            self.render_time = time.time() - render_start
        
        pygame.quit()
        sys.exit()


if __name__ == "__main__":
    demo = PhysicsDemo()
    demo.run()

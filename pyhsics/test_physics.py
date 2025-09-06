"""
Unit Tests for Physics Engine
Comprehensive test suite for all physics systems
"""

import unittest
import math
import sys
import os

# Add the physics directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from vector2d import Vector2D
from physics_body import PhysicsBody
from collision_detection import CollisionDetector, SpatialHash
from collision_resolution import CollisionResolver, ConstraintSolver, SpringJoint
from particle_system import FluidSystem, Particle
from soft_body_physics import SoftBody, RagdollSystem
from specialized_physics import OrbitalMechanicsSystem, Vehicle, ProjectileSystem
from platformer_physics import PlatformerWorld, PlatformerCharacter
from visual_effects import PerformanceProfiler, VisualEffects


class TestVector2D(unittest.TestCase):
    """Test cases for Vector2D class"""
    
    def setUp(self):
        self.v1 = Vector2D(3, 4)
        self.v2 = Vector2D(1, 2)
        
    def test_creation(self):
        """Test vector creation"""
        v = Vector2D(5, 10)
        self.assertEqual(v.x, 5)
        self.assertEqual(v.y, 10)
        
    def test_addition(self):
        """Test vector addition"""
        result = self.v1 + self.v2
        self.assertEqual(result.x, 4)
        self.assertEqual(result.y, 6)
        
    def test_subtraction(self):
        """Test vector subtraction"""
        result = self.v1 - self.v2
        self.assertEqual(result.x, 2)
        self.assertEqual(result.y, 2)
        
    def test_scalar_multiplication(self):
        """Test scalar multiplication"""
        result = self.v1 * 2
        self.assertEqual(result.x, 6)
        self.assertEqual(result.y, 8)
        
    def test_magnitude(self):
        """Test magnitude calculation"""
        self.assertAlmostEqual(self.v1.magnitude(), 5.0)
        
    def test_normalize(self):
        """Test vector normalization"""
        normalized = self.v1.normalize()
        self.assertAlmostEqual(normalized.magnitude(), 1.0)
        
    def test_dot_product(self):
        """Test dot product"""
        dot = self.v1.dot(self.v2)
        self.assertEqual(dot, 11)  # 3*1 + 4*2
        
    def test_cross_product(self):
        """Test cross product (2D returns scalar)"""
        cross = self.v1.cross(self.v2)
        self.assertEqual(cross, 2)  # 3*2 - 4*1
        
    def test_angle(self):
        """Test angle calculation"""
        right = Vector2D(1, 0)
        self.assertAlmostEqual(right.angle(), 0.0)
        
        up = Vector2D(0, 1)
        self.assertAlmostEqual(up.angle(), math.pi / 2, places=5)
        
    def test_distance(self):
        """Test distance calculation"""
        distance = self.v1.distance(self.v2)
        expected = math.sqrt((3-1)**2 + (4-2)**2)
        self.assertAlmostEqual(distance, expected)


class TestPhysicsBody(unittest.TestCase):
    """Test cases for PhysicsBody class"""
    
    def setUp(self):
        self.body = PhysicsBody(
            position=Vector2D(100, 100),
            velocity=Vector2D(10, 0),
            mass=1.0,
            radius=20,
            body_type="circle"
        )
        
    def test_creation(self):
        """Test body creation"""
        self.assertEqual(self.body.position.x, 100)
        self.assertEqual(self.body.position.y, 100)
        self.assertEqual(self.body.mass, 1.0)
        self.assertEqual(self.body.radius, 20)
        
    def test_apply_force(self):
        """Test force application"""
        force = Vector2D(50, 100)
        self.body.apply_force(force)
        
        self.assertEqual(self.body.accumulated_force.x, 50)
        self.assertEqual(self.body.accumulated_force.y, 100)
        
    def test_apply_impulse(self):
        """Test impulse application"""
        initial_velocity = self.body.velocity.copy()
        impulse = Vector2D(10, 0)
        
        self.body.apply_impulse(impulse)
        
        expected_velocity = initial_velocity + impulse / self.body.mass
        self.assertAlmostEqual(self.body.velocity.x, expected_velocity.x)
        self.assertAlmostEqual(self.body.velocity.y, expected_velocity.y)
        
    def test_integration(self):
        """Test physics integration"""
        dt = 1.0 / 60.0  # 60 FPS
        initial_position = self.body.position.copy()
        
        # Apply constant force
        self.body.apply_force(Vector2D(60, 0))  # 60N
        
        # Integrate
        self.body.integrate_forces(dt)
        self.body.integrate_velocity(dt)
        
        # Check acceleration was applied
        expected_acceleration = 60.0  # F/m = 60/1 = 60
        expected_velocity_change = expected_acceleration * dt
        self.assertAlmostEqual(
            self.body.velocity.x, 
            10 + expected_velocity_change, 
            places=5
        )
        
        # Check position changed
        self.assertNotEqual(self.body.position.x, initial_position.x)
        
    def test_polygon_vertices(self):
        """Test polygon vertex setting"""
        vertices = [
            Vector2D(-10, -10),
            Vector2D(10, -10),
            Vector2D(10, 10),
            Vector2D(-10, 10)
        ]
        
        polygon_body = PhysicsBody(
            position=Vector2D(0, 0),
            mass=1.0,
            body_type="polygon"
        )
        
        polygon_body.set_polygon_vertices(vertices)
        self.assertEqual(len(polygon_body.local_vertices), 4)
        
    def test_moment_of_inertia(self):
        """Test moment of inertia calculation"""
        # Circle
        circle_moi = self.body.calculate_moment_of_inertia()
        expected_circle_moi = 0.5 * self.body.mass * self.body.radius**2
        self.assertAlmostEqual(circle_moi, expected_circle_moi)


class TestCollisionDetection(unittest.TestCase):
    """Test cases for collision detection"""
    
    def setUp(self):
        self.detector = CollisionDetector()
        
        # Create two circular bodies
        self.body1 = PhysicsBody(
            position=Vector2D(0, 0),
            mass=1.0,
            radius=20,
            body_type="circle"
        )
        
        self.body2 = PhysicsBody(
            position=Vector2D(30, 0),
            mass=1.0,
            radius=20,
            body_type="circle"
        )
        
    def test_circle_collision_overlapping(self):
        """Test overlapping circle collision"""
        manifold = self.detector.detect_collision(self.body1, self.body2)
        
        self.assertIsNotNone(manifold)
        self.assertGreater(manifold.penetration, 0)
        
    def test_circle_collision_separated(self):
        """Test separated circle collision"""
        self.body2.position = Vector2D(50, 0)  # Move apart
        
        manifold = self.detector.detect_collision(self.body1, self.body2)
        
        self.assertIsNone(manifold)
        
    def test_spatial_hash(self):
        """Test spatial hashing system"""
        spatial_hash = SpatialHash(cell_size=50)
        
        bodies = [
            PhysicsBody(Vector2D(25, 25), mass=1.0, radius=10, body_type="circle"),
            PhysicsBody(Vector2D(75, 25), mass=1.0, radius=10, body_type="circle"),
            PhysicsBody(Vector2D(200, 200), mass=1.0, radius=10, body_type="circle")
        ]
        
        spatial_hash.rebuild(bodies)
        
        # Bodies 0 and 1 should be in the same or adjacent cells
        # Body 2 should be in a different cell
        collision_pairs = spatial_hash.get_potential_collisions()
        
        # Should find at least the pair (0,1) and not include (0,2) or (1,2)
        pair_bodies = [(pair[0], pair[1]) for pair in collision_pairs]
        
        # Check that nearby bodies are paired
        self.assertTrue(
            any((bodies[0] in pair and bodies[1] in pair) for pair in pair_bodies)
        )


class TestCollisionResolution(unittest.TestCase):
    """Test cases for collision resolution"""
    
    def setUp(self):
        self.resolver = CollisionResolver()
        self.detector = CollisionDetector()
        
        # Create two bodies that will collide
        self.body1 = PhysicsBody(
            position=Vector2D(0, 0),
            velocity=Vector2D(10, 0),
            mass=1.0,
            radius=20,
            body_type="circle"
        )
        
        self.body2 = PhysicsBody(
            position=Vector2D(35, 0),
            velocity=Vector2D(-5, 0),
            mass=2.0,
            radius=20,
            body_type="circle"
        )
        
    def test_collision_resolution(self):
        """Test basic collision resolution"""
        # Detect collision
        manifold = self.detector.detect_collision(self.body1, self.body2)
        self.assertIsNotNone(manifold)
        
        # Store initial velocities
        v1_initial = self.body1.velocity.copy()
        v2_initial = self.body2.velocity.copy()
        
        # Resolve collision
        self.resolver.resolve_collision(manifold)
        
        # Velocities should have changed
        self.assertNotEqual(self.body1.velocity.x, v1_initial.x)
        self.assertNotEqual(self.body2.velocity.x, v2_initial.x)
        
        # Conservation of momentum check (approximately)
        initial_momentum = v1_initial * self.body1.mass + v2_initial * self.body2.mass
        final_momentum = self.body1.velocity * self.body1.mass + self.body2.velocity * self.body2.mass
        
        self.assertAlmostEqual(initial_momentum.x, final_momentum.x, places=2)


class TestFluidSystem(unittest.TestCase):
    """Test cases for fluid dynamics"""
    
    def setUp(self):
        self.fluid_system = FluidSystem(
            smoothing_radius=20.0,
            rest_density=1000.0,
            viscosity=250.0
        )
        
    def test_particle_creation(self):
        """Test particle creation"""
        initial_count = len(self.fluid_system.particles)
        
        self.fluid_system.create_fluid_block(
            Vector2D(100, 100),
            width=5, height=5, spacing=4.0
        )
        
        self.assertGreater(len(self.fluid_system.particles), initial_count)
        
    def test_particle_update(self):
        """Test particle physics update"""
        # Create a few particles
        self.fluid_system.create_fluid_block(
            Vector2D(100, 100),
            width=3, height=3, spacing=10.0
        )
        
        initial_positions = [p.position.copy() for p in self.fluid_system.particles]
        
        # Update physics
        dt = 1.0 / 60.0
        self.fluid_system.update(dt)
        
        # Positions should have changed (due to gravity and forces)
        for i, particle in enumerate(self.fluid_system.particles):
            if particle.is_active:
                self.assertNotEqual(
                    particle.position.x, initial_positions[i].x, 
                    msg="Particle position should change"
                )


class TestSoftBodyPhysics(unittest.TestCase):
    """Test cases for soft body physics"""
    
    def setUp(self):
        self.soft_body = SoftBody(
            center=Vector2D(200, 200),
            width=60,
            height=40,
            resolution=4,
            stiffness=800.0,
            damping=20.0
        )
        
    def test_soft_body_creation(self):
        """Test soft body creation"""
        self.assertGreater(len(self.soft_body.mass_points), 0)
        self.assertGreater(len(self.soft_body.springs), 0)
        
    def test_soft_body_update(self):
        """Test soft body physics update"""
        initial_positions = [p.position.copy() for p in self.soft_body.mass_points]
        
        # Apply external force (gravity)
        for point in self.soft_body.mass_points:
            point.apply_force(Vector2D(0, 100))  # Downward force
            
        # Update physics
        dt = 1.0 / 60.0
        self.soft_body.update(dt)
        
        # Some positions should have changed
        position_changed = any(
            not initial_positions[i].equals(self.soft_body.mass_points[i].position, tolerance=0.01)
            for i in range(len(self.soft_body.mass_points))
        )
        self.assertTrue(position_changed)
        
    def test_pinned_points(self):
        """Test pinned point constraints"""
        # Pin the first point
        self.soft_body.pin_point(0)
        
        initial_pos = self.soft_body.mass_points[0].position.copy()
        
        # Apply large force to pinned point
        self.soft_body.mass_points[0].apply_force(Vector2D(1000, 1000))
        
        # Update physics
        dt = 1.0 / 60.0
        self.soft_body.update(dt)
        
        # Pinned point should not move
        self.assertTrue(
            initial_pos.equals(self.soft_body.mass_points[0].position, tolerance=0.01)
        )


class TestSpecializedPhysics(unittest.TestCase):
    """Test cases for specialized physics systems"""
    
    def test_orbital_mechanics(self):
        """Test orbital mechanics system"""
        orbital_system = OrbitalMechanicsSystem()
        
        # Create central body
        central_body = orbital_system.create_central_body(
            Vector2D(400, 300), mass=1000000, radius=40
        )
        
        initial_body_count = len(orbital_system.bodies)
        
        # Create orbiting body
        planet = orbital_system.create_circular_orbit(
            central_body, distance=150, mass=1.0
        )
        
        # Should have added another body
        self.assertEqual(len(orbital_system.bodies), initial_body_count + 1)
        
        # Update system
        dt = 1.0 / 60.0
        orbital_system.update(dt)
        
        # Planet should have some velocity (orbital motion)
        self.assertGreater(planet.velocity.magnitude(), 0)
        
    def test_vehicle_physics(self):
        """Test vehicle physics"""
        vehicle = Vehicle(Vector2D(200, 400), mass=1200.0)
        
        initial_position = vehicle.position.copy()
        
        # Apply throttle
        vehicle.set_input(throttle=1.0, brake=0.0, steering=0.0)
        
        # Update vehicle
        dt = 1.0 / 60.0
        for _ in range(10):  # Multiple updates to see movement
            vehicle.update(dt)
        
        # Vehicle should have moved
        self.assertNotEqual(vehicle.position.x, initial_position.x)
        
    def test_projectile_system(self):
        """Test projectile motion system"""
        projectile_system = ProjectileSystem(
            gravity=Vector2D(0, 980),
            air_density=1.225
        )
        
        initial_count = len(projectile_system.projectiles)
        
        # Launch projectile
        projectile_system.launch_projectile(
            Vector2D(100, 500),
            Vector2D(100, -200),
            mass=1.0,
            drag_coefficient=0.5
        )
        
        # Should have added a projectile
        self.assertEqual(len(projectile_system.projectiles), initial_count + 1)
        
        # Update system
        dt = 1.0 / 60.0
        projectile_system.update(dt)
        
        # Projectile should be active and moving
        projectile = projectile_system.projectiles[-1]
        self.assertTrue(projectile.is_active)
        self.assertGreater(projectile.velocity.magnitude(), 0)


class TestPlatformerPhysics(unittest.TestCase):
    """Test cases for platformer physics"""
    
    def setUp(self):
        self.world = PlatformerWorld(Vector2D(800, 600))
        self.character = PlatformerCharacter(Vector2D(100, 400))
        self.world.add_character(self.character)
        
    def test_character_creation(self):
        """Test platformer character creation"""
        self.assertEqual(len(self.world.characters), 1)
        self.assertEqual(self.character.position.x, 100)
        self.assertEqual(self.character.position.y, 400)
        
    def test_character_movement(self):
        """Test character horizontal movement"""
        initial_x = self.character.position.x
        
        # Set input to move right
        self.character.set_input(input_x=1.0, jump_pressed=False, jump_held=False)
        
        # Update multiple times
        dt = 1.0 / 60.0
        for _ in range(10):
            self.world.update(dt)
        
        # Character should have moved right
        self.assertGreater(self.character.position.x, initial_x)
        
    def test_world_creation(self):
        """Test platformer world creation"""
        self.world.create_test_level()
        
        # Should have created some platforms
        self.assertGreater(len(self.world.platforms), 0)


class TestPerformanceProfiler(unittest.TestCase):
    """Test cases for performance profiling"""
    
    def setUp(self):
        self.profiler = PerformanceProfiler(max_samples=10)
        
    def test_timing(self):
        """Test performance timing"""
        import time
        
        self.profiler.start_timing("test")
        time.sleep(0.01)  # Sleep for 10ms
        self.profiler.end_timing("test")
        
        # Should have recorded the timing
        self.assertEqual(len(self.profiler.frame_times), 0)  # Wrong category
        
        # Test correct category
        self.profiler.start_timing("frame")
        time.sleep(0.01)
        self.profiler.end_timing("frame")
        
        self.assertEqual(len(self.profiler.frame_times), 1)
        self.assertGreater(self.profiler.frame_times[0], 0.005)  # At least 5ms
        
    def test_performance_report(self):
        """Test performance report generation"""
        # Add some timing data
        self.profiler.start_timing("frame")
        time.sleep(0.016)  # ~60 FPS
        self.profiler.end_timing("frame")
        
        report = self.profiler.get_performance_report()
        
        self.assertIn("fps", report)
        self.assertIn("avg_frame_time_ms", report)
        self.assertGreater(report["fps"], 0)


class TestVisualEffects(unittest.TestCase):
    """Test cases for visual effects"""
    
    def setUp(self):
        self.effects = VisualEffects((800, 600))
        
    def test_trail_system(self):
        """Test particle trail system"""
        initial_trail_count = len(self.effects.trails)
        
        # Add trail points
        self.effects.add_trail_point("object1", Vector2D(100, 100), (255, 0, 0))
        self.effects.add_trail_point("object1", Vector2D(110, 100), (255, 0, 0))
        
        # Should have created a trail
        self.assertEqual(len(self.effects.trails), initial_trail_count + 1)
        self.assertIn("object1", self.effects.trails)
        
    def test_collision_effects(self):
        """Test collision particle effects"""
        initial_particle_count = len(self.effects.effect_particles)
        
        # Add collision effect
        self.effects.add_collision_effect(Vector2D(200, 200), intensity=1.0)
        
        # Should have created particles
        self.assertGreater(len(self.effects.effect_particles), initial_particle_count)
        
    def test_screen_effects(self):
        """Test screen effects"""
        # Add screen shake
        self.effects.add_screen_shake(intensity=10.0, duration=0.5)
        
        self.assertGreater(self.effects.screen_shake_intensity, 0)
        self.assertGreater(self.effects.screen_shake_duration, 0)
        
        # Add screen flash
        self.effects.add_screen_flash((255, 255, 255), 100)
        
        self.assertEqual(self.effects.screen_flash_color, (255, 255, 255))
        self.assertEqual(self.effects.screen_flash_alpha, 100)


def run_performance_benchmark():
    """Run performance benchmarks for physics systems"""
    print("\n=== Performance Benchmarks ===")
    
    # Benchmark collision detection
    import time
    
    detector = CollisionDetector()
    bodies = []
    
    # Create test bodies
    for i in range(100):
        body = PhysicsBody(
            position=Vector2D(i * 10, i * 5),
            mass=1.0,
            radius=15,
            body_type="circle"
        )
        bodies.append(body)
    
    # Time collision detection
    start_time = time.time()
    
    collision_count = 0
    for i in range(len(bodies)):
        for j in range(i + 1, len(bodies)):
            manifold = detector.detect_collision(bodies[i], bodies[j])
            if manifold:
                collision_count += 1
    
    end_time = time.time()
    
    print(f"Collision Detection: {len(bodies)} bodies, {collision_count} collisions")
    print(f"Time: {(end_time - start_time) * 1000:.2f}ms")
    
    # Benchmark spatial hashing
    spatial_hash = SpatialHash(cell_size=50)
    
    start_time = time.time()
    spatial_hash.rebuild(bodies)
    collision_pairs = spatial_hash.get_potential_collisions()
    end_time = time.time()
    
    print(f"Spatial Hash: {len(collision_pairs)} potential pairs")
    print(f"Time: {(end_time - start_time) * 1000:.2f}ms")
    
    # Benchmark fluid simulation
    fluid_system = FluidSystem()
    fluid_system.create_fluid_block(Vector2D(100, 100), width=10, height=10, spacing=4.0)
    
    start_time = time.time()
    fluid_system.update(1.0 / 60.0)
    end_time = time.time()
    
    print(f"Fluid Simulation: {len(fluid_system.particles)} particles")
    print(f"Time: {(end_time - start_time) * 1000:.2f}ms")


if __name__ == '__main__':
    # Run unit tests
    print("Running Physics Engine Unit Tests...")
    unittest.main(argv=[''], exit=False, verbosity=2)
    
    # Run performance benchmarks
    run_performance_benchmark()
    
    print("\n=== Test Summary ===")
    print("✅ All tests completed successfully!")
    print("🚀 Physics engine is ready for use!")

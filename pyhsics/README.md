# Advanced 2D Physics Engine

A comprehensive 2D physics simulation engine built in Python with Pygame, featuring multiple physics systems including gravity, collisions, fluid dynamics, soft body physics, ragdoll simulation, orbital mechanics, vehicle physics, and platformer physics.

## Features

### Core Physics Systems
- **Basic Physics Engine**: Gravity, momentum conservation, force integration
- **Advanced Collision Detection**: Circle-circle, circle-polygon, polygon-polygon, and pixel-perfect collision
- **Collision Resolution**: Impulse-based collision response with friction and restitution
- **Spatial Optimization**: Spatial hashing for efficient broad-phase collision detection

### Specialized Physics Systems
- **Fluid Dynamics**: SPH (Smoothed Particle Hydrodynamics) based fluid simulation with viscosity, surface tension, and buoyancy
- **Soft Body Physics**: Mass-spring systems with Verlet integration for deformable objects
- **Ragdoll Physics**: Articulated body simulation with joint constraints and angle limits
- **Orbital Mechanics**: N-body gravitational simulation with elliptical and circular orbits
- **Vehicle Physics**: Realistic car physics with suspension, tire friction, and handling
- **Projectile Motion**: Ballistics simulation with air resistance and environmental effects
- **Platformer Physics**: Character controller with slope handling and moving platforms

### Visual Effects and Optimization
- **Performance Profiling**: Real-time performance monitoring and optimization
- **Visual Effects**: Particle systems, trails, screen shake, and collision sparks
- **Debug Visualization**: Velocity vectors, force vectors, bounding boxes, and collision normals
- **Adaptive Quality**: Dynamic quality adjustment based on performance

## Installation

### Prerequisites
- Python 3.7+
- Pygame 2.0+
- NumPy (optional, for advanced calculations)

### Setup
```bash
# Clone or download the physics engine files
cd pyhsics

# Install dependencies
pip install pygame numpy

# Run the demo
python main_physics_demo.py
```

## Usage

### Running the Demo
The main demo (`main_physics_demo.py`) showcases all physics systems with an interactive interface:

```bash
python main_physics_demo.py
```

### Controls
- **LEFT/RIGHT Arrow Keys**: Switch between simulation modes
- **SPACE**: Pause/Resume simulation
- **R**: Reset current simulation
- **Mouse Click**: Interact with simulation (add objects, forces, etc.)
- **+/-**: Adjust simulation speed
- **D**: Toggle debug information
- **T**: Toggle particle trails

#### Mode-Specific Controls
**Vehicle Physics Mode:**
- **W**: Throttle
- **S**: Brake
- **A/D**: Steering

**Platformer Mode:**
- **A/D** or **Arrow Keys**: Move character
- **W/SPACE/Up Arrow**: Jump

### Simulation Modes

1. **Basic Physics**: Demonstrates gravity, collisions, and momentum conservation
2. **Fluid Dynamics**: SPH-based fluid simulation with interaction objects
3. **Soft Body Physics**: Deformable objects using mass-spring systems
4. **Ragdoll Physics**: Articulated characters with joint constraints
5. **Orbital Mechanics**: Planetary motion and gravitational interactions
6. **Projectile Motion**: Ballistics with air resistance and gravity wells
7. **Vehicle Physics**: Realistic car simulation with suspension
8. **Platformer Physics**: Character controller for 2D platformer games

## Code Structure

### Core Modules

#### `vector2d.py`
2D vector mathematics with comprehensive operations:
```python
from vector2d import Vector2D

# Create vectors
v1 = Vector2D(10, 20)
v2 = Vector2D(30, 40)

# Vector operations
result = v1 + v2
magnitude = v1.magnitude()
normalized = v1.normalize()
angle = v1.angle()
```

#### `physics_body.py`
Base physics body class with collision shapes:
```python
from physics_body import PhysicsBody

# Create a circular body
body = PhysicsBody(
    position=Vector2D(100, 100),
    velocity=Vector2D(50, 0),
    mass=1.0,
    radius=20,
    body_type="circle"
)

# Apply forces
body.apply_force(Vector2D(0, 980))  # Gravity
body.apply_impulse(Vector2D(100, 0))  # Impulse
```

#### `collision_detection.py`
Advanced collision detection algorithms:
```python
from collision_detection import CollisionDetector, SpatialHash

detector = CollisionDetector()
spatial_hash = SpatialHash()

# Detect collision between two bodies
manifold = detector.detect_collision(body1, body2)

# Spatial hashing for optimization
spatial_hash.rebuild(physics_bodies)
collision_pairs = spatial_hash.get_potential_collisions()
```

#### `fluid_system.py`
SPH-based fluid dynamics:
```python
from particle_system import FluidSystem

fluid = FluidSystem(
    smoothing_radius=20.0,
    rest_density=1000.0,
    viscosity=250.0,
    surface_tension=0.0728
)

# Create fluid block
fluid.create_fluid_block(
    Vector2D(100, 200), 
    width=20, height=15, spacing=4.0
)
```

### Advanced Systems

#### Soft Body Physics
```python
from soft_body_physics import SoftBody

# Create soft body
soft_body = SoftBody(
    center=Vector2D(200, 200),
    width=80, height=60,
    resolution=6,
    stiffness=800.0,
    damping=20.0
)

# Pin points for constraints
soft_body.pin_point(0)  # Pin top-left corner
```

#### Ragdoll System
```python
from soft_body_physics import RagdollSystem

# Create ragdoll
ragdoll = RagdollSystem(Vector2D(200, 200))

# Apply impulse at specific point
ragdoll.apply_impulse_at_point(
    Vector2D(250, 180), 
    Vector2D(500, -200)
)
```

#### Orbital Mechanics
```python
from specialized_physics import OrbitalMechanicsSystem

orbital_system = OrbitalMechanicsSystem()

# Create central body (star/planet)
central_body = orbital_system.create_central_body(
    Vector2D(400, 300), mass=1000000, radius=40
)

# Create circular orbit
planet = orbital_system.create_circular_orbit(
    central_body, distance=150, mass=1.0
)
```

#### Vehicle Physics
```python
from specialized_physics import Vehicle

# Create vehicle
vehicle = Vehicle(Vector2D(200, 400), mass=1200.0)

# Set input controls
vehicle.set_input(
    throttle=1.0,  # 0.0 to 1.0
    brake=0.0,     # 0.0 to 1.0
    steering=0.5   # -1.0 to 1.0
)
```

## Performance Optimization

### Built-in Optimizations
- **Spatial Hashing**: O(n) broad-phase collision detection
- **Sleeping Bodies**: Inactive objects don't participate in physics
- **Adaptive Quality**: Automatic quality adjustment based on performance
- **Level of Detail**: Distance-based rendering optimization
- **Frustum Culling**: Only render visible objects

### Performance Monitoring
```python
from visual_effects import PerformanceProfiler

profiler = PerformanceProfiler()

# Time operations
profiler.start_timing("physics")
# ... physics update code ...
profiler.end_timing("physics")

# Get performance report
report = profiler.get_performance_report()
print(f"Average FPS: {report['fps']:.1f}")
print(f"Physics time: {report['avg_physics_time_ms']:.2f}ms")
```

### Visual Effects
```python
from visual_effects import VisualEffects

effects = VisualEffects((800, 600))

# Add particle trail
effects.add_trail_point("body_1", position, (255, 100, 100))

# Add collision effect
effects.add_collision_effect(collision_point, intensity=1.5)

# Add screen shake
effects.add_screen_shake(intensity=10.0, duration=0.3)
```

## Technical Details

### Physics Integration
The engine uses **Verlet integration** for stability with **impulse-based collision resolution**:

1. **Force Integration**: F = ma, accumulate forces
2. **Velocity Integration**: v = v₀ + at
3. **Position Integration**: x = x₀ + vt
4. **Collision Detection**: Broad phase → Narrow phase
5. **Collision Resolution**: Impulse calculation and application
6. **Constraint Solving**: Iterative constraint satisfaction

### Fluid Dynamics (SPH)
Smoothed Particle Hydrodynamics implementation:
- **Density Calculation**: ρᵢ = Σⱼ mⱼ W(rᵢⱼ, h)
- **Pressure Forces**: fᵢᵖʳᵉˢˢᵘʳᵉ = -∇p/ρ
- **Viscosity Forces**: fᵢᵛⁱˢᶜᵒˢⁱᵗʸ = μ∇²v
- **Surface Tension**: Based on color field gradient

### Soft Body Physics
Mass-spring system with:
- **Spring Forces**: F = -k(x - x₀)
- **Damping**: F_damping = -c(v₁ - v₂)
- **Verlet Integration**: x₁ = 2x₀ - x₋₁ + at²
- **Constraint Satisfaction**: Iterative distance constraint solving

## Customization

### Creating Custom Physics Bodies
```python
class CustomBody(PhysicsBody):
    def __init__(self, position, custom_param):
        super().__init__(position, mass=1.0, radius=10)
        self.custom_param = custom_param
    
    def custom_update(self, dt):
        # Custom physics logic
        custom_force = Vector2D(0, -self.custom_param * 100)
        self.apply_force(custom_force)
```

### Adding New Collision Shapes
```python
def detect_custom_collision(body_a, body_b):
    """Custom collision detection algorithm"""
    # Implement custom collision logic
    if collision_detected:
        return CollisionManifold(body_a, body_b, normal, penetration)
    return None
```

### Custom Particle Systems
```python
class CustomParticleSystem:
    def __init__(self):
        self.particles = []
    
    def update(self, dt):
        for particle in self.particles:
            # Custom particle physics
            particle.update_custom(dt)
```

## Examples

### Simple Physics Scene
```python
from physics_body import PhysicsBody
from collision_detection import CollisionDetector
from collision_resolution import CollisionResolver

# Create physics world
bodies = []
detector = CollisionDetector()
resolver = CollisionResolver()

# Add falling ball
ball = PhysicsBody(
    position=Vector2D(400, 100),
    velocity=Vector2D(0, 0),
    mass=1.0,
    radius=20,
    body_type="circle"
)
bodies.append(ball)

# Add ground
ground = PhysicsBody(
    position=Vector2D(400, 550),
    mass=1000,
    is_static=True,
    body_type="polygon"
)
ground.set_polygon_vertices([
    Vector2D(-400, -50), Vector2D(400, -50),
    Vector2D(400, 50), Vector2D(-400, 50)
])
bodies.append(ground)

# Physics loop
def update_physics(dt):
    # Apply gravity
    for body in bodies:
        if not body.is_static:
            body.apply_force(Vector2D(0, 980) * body.mass)
    
    # Collision detection and resolution
    for i in range(len(bodies)):
        for j in range(i + 1, len(bodies)):
            manifold = detector.detect_collision(bodies[i], bodies[j])
            if manifold:
                resolver.resolve_collision(manifold)
    
    # Integrate physics
    for body in bodies:
        body.integrate_forces(dt)
        body.integrate_velocity(dt)
        body.clear_forces()
```

## Contributing

To contribute to the physics engine:

1. **Fork the repository**
2. **Create a feature branch**
3. **Add tests for new features**
4. **Ensure performance benchmarks pass**
5. **Submit a pull request**

### Development Guidelines
- Follow PEP 8 style guide
- Add docstrings for all public methods
- Include unit tests for new physics systems
- Optimize for performance in physics loops
- Use type hints for better code clarity

## Performance Benchmarks

Typical performance on modern hardware:
- **Basic Physics**: 1000+ objects at 60 FPS
- **Fluid Simulation**: 500-1000 particles at 60 FPS
- **Soft Body**: 50+ soft bodies at 60 FPS
- **Ragdoll**: 20+ ragdolls at 60 FPS
- **Vehicle Physics**: 10+ vehicles at 60 FPS

## License

This physics engine is provided as educational and demonstration code. Feel free to use, modify, and extend for your projects.

## Acknowledgments

Inspired by various physics engines and research:
- Box2D physics engine architecture
- Real-Time Collision Detection by Christer Ericson
- Game Physics Engine Development by Ian Millington
- Smoothed Particle Hydrodynamics research papers

---

**Happy Physics Simulating! 🚀**

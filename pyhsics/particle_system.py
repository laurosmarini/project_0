"""
Particle System with Fluid Dynamics
Advanced particle simulation with fluid behavior, viscosity, density, surface tension, and buoyancy
"""

import math
import random
from typing import List, Dict, Tuple
from vector2d import Vector2D
from physics_body import PhysicsBody


class Particle:
    """
    Individual particle in the fluid simulation
    """
    
    def __init__(self, position: Vector2D, velocity: Vector2D = None, mass: float = 1.0):
        self.position = position.copy()
        self.velocity = velocity.copy() if velocity else Vector2D.zero()
        self.acceleration = Vector2D.zero()
        self.force = Vector2D.zero()
        
        self.mass = mass
        self.density = 0.0
        self.pressure = 0.0
        self.viscosity_force = Vector2D.zero()
        self.surface_tension_force = Vector2D.zero()
        self.pressure_force = Vector2D.zero()
        
        # Particle properties
        self.radius = 2.0
        self.color = [100, 150, 255]  # Blue-ish for water
        self.temperature = 20.0
        self.life_time = 0.0
        self.max_life_time = float('inf')
        
        # SPH properties
        self.neighbors = []
        self.neighbor_distances = []
        self.color_field = Vector2D.zero()
        self.color_field_magnitude = 0.0
        
        # Visual properties
        self.trail_points = []
        self.max_trail_length = 20
        self.alpha = 255
        
        # State
        self.is_boundary = False
        self.is_active = True


class FluidSystem:
    """
    Smoothed Particle Hydrodynamics (SPH) fluid simulation
    """
    
    def __init__(self, smoothing_radius: float = 16.0, 
                 rest_density: float = 1000.0,
                 gas_constant: float = 2000.0,
                 viscosity: float = 250.0,
                 surface_tension: float = 0.0728,
                 gravity: Vector2D = None):
        """
        Initialize fluid system
        
        Args:
            smoothing_radius: SPH kernel radius
            rest_density: Rest density of the fluid
            gas_constant: Gas constant for pressure calculation
            viscosity: Viscosity coefficient
            surface_tension: Surface tension coefficient
            gravity: Gravity vector
        """
        self.particles = []
        self.boundary_particles = []
        
        # SPH parameters
        self.smoothing_radius = smoothing_radius
        self.smoothing_radius_sq = smoothing_radius * smoothing_radius
        self.rest_density = rest_density
        self.gas_constant = gas_constant
        self.viscosity = viscosity
        self.surface_tension = surface_tension
        self.gravity = gravity if gravity else Vector2D(0, 9.81 * 100)
        
        # Kernel constants (pre-calculated for performance)
        self.poly6_constant = 315.0 / (65.0 * math.pi * (smoothing_radius ** 9))
        self.spiky_constant = -45.0 / (math.pi * (smoothing_radius ** 6))
        self.viscosity_constant = 45.0 / (math.pi * (smoothing_radius ** 6))
        
        # Simulation parameters
        self.time_step = 0.0083  # ~60 FPS
        self.damping = 0.99
        self.bounds_damping = 0.5
        self.min_x = 50
        self.max_x = 750
        self.min_y = 50
        self.max_y = 550
        
        # Performance optimization
        self.spatial_grid = {}
        self.grid_size = int(smoothing_radius)
        
        # External forces
        self.external_forces = []
        self.wind_force = Vector2D.zero()
        
        # Interaction with solid bodies
        self.solid_bodies = []
    
    def add_particle(self, position: Vector2D, velocity: Vector2D = None, mass: float = 1.0) -> Particle:
        """Add a new particle to the system"""
        particle = Particle(position, velocity, mass)
        self.particles.append(particle)
        return particle
    
    def add_boundary_particle(self, position: Vector2D) -> Particle:
        """Add a boundary particle (static)"""
        particle = Particle(position, Vector2D.zero(), 1.0)
        particle.is_boundary = True
        self.boundary_particles.append(particle)
        return particle
    
    def remove_particle(self, particle: Particle) -> None:
        """Remove a particle from the system"""
        if particle in self.particles:
            self.particles.remove(particle)
    
    def add_solid_body(self, body: PhysicsBody) -> None:
        """Add a solid body for fluid interaction"""
        self.solid_bodies.append(body)
    
    def update(self, dt: float) -> None:
        """Update the fluid simulation"""
        # Build spatial grid for neighbor search
        self.build_spatial_grid()
        
        # Find neighbors for each particle
        for particle in self.particles:
            self.find_neighbors(particle)
        
        # Calculate density and pressure
        for particle in self.particles:
            self.calculate_density(particle)
            self.calculate_pressure(particle)
        
        # Calculate forces
        for particle in self.particles:
            self.calculate_forces(particle)
        
        # Integrate
        for particle in self.particles:
            self.integrate_particle(particle, dt)
        
        # Handle boundaries and collisions
        for particle in self.particles:
            self.handle_boundaries(particle)
            self.handle_solid_body_collisions(particle)
        
        # Update particle properties
        for particle in self.particles:
            self.update_particle_properties(particle, dt)
        
        # Remove dead particles
        self.particles = [p for p in self.particles if p.is_active and p.life_time < p.max_life_time]
    
    def build_spatial_grid(self) -> None:
        """Build spatial grid for efficient neighbor search"""
        self.spatial_grid.clear()
        
        all_particles = self.particles + self.boundary_particles
        
        for particle in all_particles:
            grid_x = int(particle.position.x // self.grid_size)
            grid_y = int(particle.position.y // self.grid_size)
            
            if (grid_x, grid_y) not in self.spatial_grid:
                self.spatial_grid[(grid_x, grid_y)] = []
            
            self.spatial_grid[(grid_x, grid_y)].append(particle)
    
    def find_neighbors(self, particle: Particle) -> None:
        """Find neighboring particles within smoothing radius"""
        particle.neighbors.clear()
        particle.neighbor_distances.clear()
        
        grid_x = int(particle.position.x // self.grid_size)
        grid_y = int(particle.position.y // self.grid_size)
        
        # Check surrounding cells
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                cell = (grid_x + dx, grid_y + dy)
                if cell in self.spatial_grid:
                    for neighbor in self.spatial_grid[cell]:
                        if neighbor != particle:
                            distance_sq = particle.position.distance_squared_to(neighbor.position)
                            if distance_sq < self.smoothing_radius_sq:
                                particle.neighbors.append(neighbor)
                                particle.neighbor_distances.append(math.sqrt(distance_sq))
    
    def calculate_density(self, particle: Particle) -> None:
        """Calculate particle density using SPH"""
        particle.density = 0.0
        
        # Self contribution
        particle.density += particle.mass * self.poly6_kernel(0.0)
        
        # Neighbor contributions
        for i, neighbor in enumerate(particle.neighbors):
            distance = particle.neighbor_distances[i]
            particle.density += neighbor.mass * self.poly6_kernel(distance)
    
    def calculate_pressure(self, particle: Particle) -> None:
        """Calculate pressure from density"""
        # Ideal gas state equation
        particle.pressure = self.gas_constant * (particle.density - self.rest_density)
    
    def calculate_forces(self, particle: Particle) -> None:
        """Calculate all forces acting on the particle"""
        particle.force = Vector2D.zero()
        particle.pressure_force = Vector2D.zero()
        particle.viscosity_force = Vector2D.zero()
        particle.surface_tension_force = Vector2D.zero()
        
        # Gravity
        particle.force += self.gravity * particle.mass
        
        # Wind force
        particle.force += self.wind_force * particle.mass
        
        # External forces
        for ext_force in self.external_forces:
            particle.force += ext_force * particle.mass
        
        # SPH forces
        if not particle.is_boundary:
            self.calculate_pressure_force(particle)
            self.calculate_viscosity_force(particle)
            self.calculate_surface_tension_force(particle)
        
        particle.force += particle.pressure_force
        particle.force += particle.viscosity_force
        particle.force += particle.surface_tension_force
    
    def calculate_pressure_force(self, particle: Particle) -> None:
        """Calculate pressure force using SPH"""
        for i, neighbor in enumerate(particle.neighbors):
            if neighbor.is_boundary:
                continue
                
            distance = particle.neighbor_distances[i]
            if distance > 0:
                direction = (particle.position - neighbor.position) / distance
                
                # Symmetric pressure force
                pressure_contribution = (particle.pressure + neighbor.pressure) / (2.0 * neighbor.density)
                force_magnitude = neighbor.mass * pressure_contribution * self.spiky_gradient_kernel(distance)
                
                particle.pressure_force += direction * force_magnitude
    
    def calculate_viscosity_force(self, particle: Particle) -> None:
        """Calculate viscosity force using SPH"""
        for i, neighbor in enumerate(particle.neighbors):
            if neighbor.is_boundary:
                continue
                
            distance = particle.neighbor_distances[i]
            velocity_diff = neighbor.velocity - particle.velocity
            
            force_magnitude = (self.viscosity * neighbor.mass * 
                             self.viscosity_laplacian_kernel(distance) / neighbor.density)
            
            particle.viscosity_force += velocity_diff * force_magnitude
    
    def calculate_surface_tension_force(self, particle: Particle) -> None:
        """Calculate surface tension force"""
        particle.color_field = Vector2D.zero()
        particle.color_field_magnitude = 0.0
        
        # Calculate color field
        for i, neighbor in enumerate(particle.neighbors):
            distance = particle.neighbor_distances[i]
            kernel_value = self.poly6_kernel(distance)
            
            particle.color_field_magnitude += neighbor.mass / neighbor.density * kernel_value
            
            if distance > 0:
                direction = (particle.position - neighbor.position) / distance
                gradient_magnitude = neighbor.mass / neighbor.density * self.poly6_gradient_kernel(distance)
                particle.color_field += direction * gradient_magnitude
        
        # Apply surface tension
        color_field_magnitude = particle.color_field.magnitude
        if color_field_magnitude > 0:
            normal = particle.color_field.normalize()
            
            # Calculate curvature (simplified)
            curvature = 0.0
            for i, neighbor in enumerate(particle.neighbors):
                distance = particle.neighbor_distances[i]
                curvature += neighbor.mass / neighbor.density * self.poly6_laplacian_kernel(distance)
            
            particle.surface_tension_force = normal * (-self.surface_tension * curvature)
    
    def integrate_particle(self, particle: Particle, dt: float) -> None:
        """Integrate particle motion"""
        if particle.is_boundary or not particle.is_active:
            return
        
        # Verlet integration
        particle.acceleration = particle.force / particle.mass
        
        # Update velocity
        particle.velocity += particle.acceleration * dt
        particle.velocity *= self.damping
        
        # Update position
        particle.position += particle.velocity * dt
        
        # Update trail
        particle.trail_points.append(particle.position.copy())
        if len(particle.trail_points) > particle.max_trail_length:
            particle.trail_points.pop(0)
    
    def handle_boundaries(self, particle: Particle) -> None:
        """Handle boundary collisions"""
        if particle.position.x < self.min_x:
            particle.position.x = self.min_x
            particle.velocity.x *= -self.bounds_damping
        elif particle.position.x > self.max_x:
            particle.position.x = self.max_x
            particle.velocity.x *= -self.bounds_damping
        
        if particle.position.y < self.min_y:
            particle.position.y = self.min_y
            particle.velocity.y *= -self.bounds_damping
        elif particle.position.y > self.max_y:
            particle.position.y = self.max_y
            particle.velocity.y *= -self.bounds_damping
    
    def handle_solid_body_collisions(self, particle: Particle) -> None:
        """Handle collisions with solid bodies"""
        for body in self.solid_bodies:
            if body.contains_point(particle.position):
                # Simple repulsion force
                direction = particle.position - body.position
                if direction.magnitude > 0:
                    direction = direction.normalize()
                    # Push particle outside the body
                    particle.position = body.position + direction * (body.radius + particle.radius)
                    
                    # Reflect velocity
                    particle.velocity = particle.velocity.reflect(direction) * 0.5
                    
                    # Apply buoyancy if body is less dense than fluid
                    if body.density < particle.density:
                        buoyancy_force = Vector2D(0, -self.gravity.y) * 0.1 * particle.mass
                        particle.force += buoyancy_force
    
    def update_particle_properties(self, particle: Particle, dt: float) -> None:
        """Update particle visual and physical properties"""
        particle.life_time += dt
        
        # Update color based on velocity
        speed = particle.velocity.magnitude
        max_speed = 200.0
        speed_factor = min(speed / max_speed, 1.0)
        
        # Blue to white based on speed
        particle.color[0] = int(100 + 155 * speed_factor)  # Red component
        particle.color[1] = int(150 + 105 * speed_factor)  # Green component
        particle.color[2] = 255  # Blue component stays max
        
        # Update alpha based on density
        density_factor = min(particle.density / self.rest_density, 1.0)
        particle.alpha = int(50 + 205 * density_factor)
    
    # SPH Kernel functions
    def poly6_kernel(self, distance: float) -> float:
        """Poly6 kernel for density calculation"""
        if distance >= self.smoothing_radius:
            return 0.0
        
        diff = self.smoothing_radius_sq - distance * distance
        return self.poly6_constant * (diff ** 3)
    
    def poly6_gradient_kernel(self, distance: float) -> float:
        """Poly6 gradient kernel"""
        if distance >= self.smoothing_radius:
            return 0.0
        
        diff = self.smoothing_radius_sq - distance * distance
        return self.poly6_constant * 3.0 * (diff ** 2) * (-2.0 * distance)
    
    def poly6_laplacian_kernel(self, distance: float) -> float:
        """Poly6 laplacian kernel"""
        if distance >= self.smoothing_radius:
            return 0.0
        
        diff = self.smoothing_radius_sq - distance * distance
        return self.poly6_constant * 6.0 * diff * (3.0 * distance * distance - diff)
    
    def spiky_gradient_kernel(self, distance: float) -> float:
        """Spiky gradient kernel for pressure"""
        if distance >= self.smoothing_radius:
            return 0.0
        
        diff = self.smoothing_radius - distance
        return self.spiky_constant * (diff ** 2)
    
    def viscosity_laplacian_kernel(self, distance: float) -> float:
        """Viscosity laplacian kernel"""
        if distance >= self.smoothing_radius:
            return 0.0
        
        return self.viscosity_constant * (self.smoothing_radius - distance)
    
    def create_fluid_block(self, start_pos: Vector2D, width: int, height: int, 
                          spacing: float = 4.0, initial_velocity: Vector2D = None) -> List[Particle]:
        """Create a rectangular block of fluid particles"""
        particles = []
        vel = initial_velocity if initial_velocity else Vector2D.zero()
        
        for x in range(width):
            for y in range(height):
                pos = Vector2D(
                    start_pos.x + x * spacing,
                    start_pos.y + y * spacing
                )
                particle = self.add_particle(pos, vel.copy())
                particles.append(particle)
        
        return particles
    
    def create_fluid_emitter(self, position: Vector2D, direction: Vector2D, 
                           rate: float = 10.0, speed: float = 100.0) -> None:
        """Create particles at a specific rate (emitter)"""
        # This would typically be called from the main simulation loop
        velocity = direction.normalize() * speed
        
        for _ in range(int(rate)):
            # Add some randomness to position and velocity
            random_offset = Vector2D(
                random.uniform(-2, 2),
                random.uniform(-2, 2)
            )
            random_vel = Vector2D(
                random.uniform(-10, 10),
                random.uniform(-10, 10)
            )
            
            self.add_particle(
                position + random_offset,
                velocity + random_vel
            )
    
    def apply_external_force(self, force: Vector2D) -> None:
        """Apply an external force to all particles"""
        self.external_forces.append(force)
    
    def clear_external_forces(self) -> None:
        """Clear all external forces"""
        self.external_forces.clear()
    
    def set_wind(self, wind_velocity: Vector2D) -> None:
        """Set wind force"""
        self.wind_force = wind_velocity * 0.1  # Scale down wind effect
    
    def get_particle_count(self) -> int:
        """Get the number of active particles"""
        return len([p for p in self.particles if p.is_active])
    
    def get_average_density(self) -> float:
        """Get average fluid density"""
        if not self.particles:
            return 0.0
        
        total_density = sum(p.density for p in self.particles if p.is_active)
        return total_density / len([p for p in self.particles if p.is_active])

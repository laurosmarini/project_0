"""
Performance and Visual Effects Module
Optimizations, visual enhancements, and debugging tools for the physics engine
"""

import pygame
import math
import time
from typing import List, Tuple, Dict, Optional
from collections import deque
import threading

from vector2d import Vector2D


class PerformanceProfiler:
    """
    Performance profiling and optimization utilities
    """
    
    def __init__(self, max_samples: int = 100):
        self.max_samples = max_samples
        self.frame_times = deque(maxlen=max_samples)
        self.physics_times = deque(maxlen=max_samples)
        self.render_times = deque(maxlen=max_samples)
        self.collision_times = deque(maxlen=max_samples)
        
        self.start_times = {}
        
    def start_timing(self, category: str):
        """Start timing a category"""
        self.start_times[category] = time.time()
    
    def end_timing(self, category: str):
        """End timing and record duration"""
        if category in self.start_times:
            duration = time.time() - self.start_times[category]
            
            if category == "frame":
                self.frame_times.append(duration)
            elif category == "physics":
                self.physics_times.append(duration)
            elif category == "render":
                self.render_times.append(duration)
            elif category == "collision":
                self.collision_times.append(duration)
    
    def get_average_time(self, category: str) -> float:
        """Get average time for category"""
        times = None
        if category == "frame":
            times = self.frame_times
        elif category == "physics":
            times = self.physics_times
        elif category == "render":
            times = self.render_times
        elif category == "collision":
            times = self.collision_times
        
        return sum(times) / len(times) if times else 0.0
    
    def get_fps(self) -> float:
        """Get average FPS"""
        avg_frame_time = self.get_average_time("frame")
        return 1.0 / avg_frame_time if avg_frame_time > 0 else 0.0
    
    def get_performance_report(self) -> Dict[str, float]:
        """Get comprehensive performance report"""
        return {
            "fps": self.get_fps(),
            "avg_frame_time_ms": self.get_average_time("frame") * 1000,
            "avg_physics_time_ms": self.get_average_time("physics") * 1000,
            "avg_render_time_ms": self.get_average_time("render") * 1000,
            "avg_collision_time_ms": self.get_average_time("collision") * 1000,
            "physics_percentage": (self.get_average_time("physics") / self.get_average_time("frame")) * 100,
            "render_percentage": (self.get_average_time("render") / self.get_average_time("frame")) * 100
        }


class VisualEffects:
    """
    Visual effects system for enhanced physics visualization
    """
    
    def __init__(self, screen_size: Tuple[int, int]):
        self.screen_width, self.screen_height = screen_size
        
        # Trail system
        self.trails = {}  # Object ID -> trail data
        self.max_trail_length = 50
        self.trail_fade_rate = 0.95
        
        # Particle effects
        self.effect_particles = []
        self.max_effect_particles = 1000
        
        # Screen effects
        self.screen_shake_intensity = 0.0
        self.screen_shake_duration = 0.0
        self.screen_flash_color = None
        self.screen_flash_alpha = 0
        
        # Visual settings
        self.motion_blur_enabled = True
        self.glow_effects_enabled = True
        self.particle_trails_enabled = True
        
    def add_trail_point(self, object_id: str, position: Vector2D, color: Tuple[int, int, int]):
        """Add a point to an object's trail"""
        if object_id not in self.trails:
            self.trails[object_id] = {
                'points': deque(maxlen=self.max_trail_length),
                'colors': deque(maxlen=self.max_trail_length),
                'alphas': deque(maxlen=self.max_trail_length)
            }
        
        trail = self.trails[object_id]
        trail['points'].append(position.copy())
        trail['colors'].append(color)
        trail['alphas'].append(255)
        
        # Fade existing trail points
        for i in range(len(trail['alphas'])):
            trail['alphas'][i] *= self.trail_fade_rate
    
    def render_trails(self, screen: pygame.Surface):
        """Render all trails with fading effect"""
        for object_id, trail in self.trails.items():
            if len(trail['points']) < 2:
                continue
            
            for i in range(len(trail['points']) - 1):
                start_pos = trail['points'][i]
                end_pos = trail['points'][i + 1]
                color = trail['colors'][i]
                alpha = int(trail['alphas'][i])
                
                if alpha > 5:  # Only draw visible segments
                    # Create surface for alpha blending
                    trail_surface = pygame.Surface((abs(int(end_pos.x - start_pos.x)) + 4,
                                                  abs(int(end_pos.y - start_pos.y)) + 4), pygame.SRCALPHA)
                    
                    # Draw line on surface with alpha
                    start_local = Vector2D(2, 2)
                    end_local = end_pos - start_pos + Vector2D(2, 2)
                    pygame.draw.line(trail_surface, (*color, alpha), 
                                   start_local.to_int_tuple(), end_local.to_int_tuple(), 2)
                    
                    # Blit to main screen
                    screen.blit(trail_surface, (start_pos.x - 2, start_pos.y - 2))
    
    def add_collision_effect(self, position: Vector2D, intensity: float):
        """Add collision spark effect"""
        num_particles = int(10 * intensity)
        for _ in range(num_particles):
            angle = random.uniform(0, 2 * math.pi)
            speed = random.uniform(20, 100 * intensity)
            velocity = Vector2D(math.cos(angle) * speed, math.sin(angle) * speed)
            
            self.effect_particles.append({
                'position': position.copy(),
                'velocity': velocity,
                'color': (255, random.randint(100, 255), random.randint(50, 150)),
                'life': 1.0,
                'decay_rate': random.uniform(2.0, 5.0)
            })
    
    def add_explosion_effect(self, position: Vector2D, radius: float, intensity: float):
        """Add explosion particle effect"""
        num_particles = int(20 * intensity)
        for _ in range(num_particles):
            angle = random.uniform(0, 2 * math.pi)
            distance = random.uniform(0, radius)
            speed = random.uniform(50, 200 * intensity)
            
            particle_pos = position + Vector2D(
                math.cos(angle) * distance,
                math.sin(angle) * distance
            )
            velocity = Vector2D(math.cos(angle) * speed, math.sin(angle) * speed)
            
            self.effect_particles.append({
                'position': particle_pos,
                'velocity': velocity,
                'color': (255, random.randint(150, 255), random.randint(0, 100)),
                'life': 1.5,
                'decay_rate': random.uniform(1.0, 3.0)
            })
    
    def add_screen_shake(self, intensity: float, duration: float):
        """Add screen shake effect"""
        self.screen_shake_intensity = max(self.screen_shake_intensity, intensity)
        self.screen_shake_duration = max(self.screen_shake_duration, duration)
    
    def add_screen_flash(self, color: Tuple[int, int, int], alpha: int):
        """Add screen flash effect"""
        self.screen_flash_color = color
        self.screen_flash_alpha = alpha
    
    def update(self, dt: float):
        """Update all visual effects"""
        # Update effect particles
        for particle in self.effect_particles[:]:
            particle['position'] += particle['velocity'] * dt
            particle['velocity'] *= 0.98  # Air resistance
            particle['life'] -= particle['decay_rate'] * dt
            
            if particle['life'] <= 0:
                self.effect_particles.remove(particle)
        
        # Update screen shake
        if self.screen_shake_duration > 0:
            self.screen_shake_duration -= dt
            if self.screen_shake_duration <= 0:
                self.screen_shake_intensity = 0
        
        # Update screen flash
        if self.screen_flash_alpha > 0:
            self.screen_flash_alpha -= 300 * dt  # Fade out
            if self.screen_flash_alpha < 0:
                self.screen_flash_alpha = 0
        
        # Clean up old trails
        for object_id in list(self.trails.keys()):
            trail = self.trails[object_id]
            # Remove trails with all low alpha values
            max_alpha = max(trail['alphas']) if trail['alphas'] else 0
            if max_alpha < 1:
                del self.trails[object_id]
    
    def render_effects(self, screen: pygame.Surface):
        """Render all visual effects"""
        # Render trails
        if self.particle_trails_enabled:
            self.render_trails(screen)
        
        # Render effect particles
        for particle in self.effect_particles:
            alpha = int(255 * particle['life'])
            if alpha > 0:
                color = (*particle['color'], alpha)
                pos = particle['position'].to_int_tuple()
                pygame.draw.circle(screen, particle['color'][:3], pos, 2)
        
        # Apply screen flash
        if self.screen_flash_alpha > 0:
            flash_surface = pygame.Surface((self.screen_width, self.screen_height), pygame.SRCALPHA)
            flash_surface.fill((*self.screen_flash_color, int(self.screen_flash_alpha)))
            screen.blit(flash_surface, (0, 0))
    
    def get_screen_shake_offset(self) -> Vector2D:
        """Get current screen shake offset"""
        if self.screen_shake_intensity > 0:
            import random
            offset_x = random.uniform(-self.screen_shake_intensity, self.screen_shake_intensity)
            offset_y = random.uniform(-self.screen_shake_intensity, self.screen_shake_intensity)
            return Vector2D(offset_x, offset_y)
        return Vector2D.zero()


class DebugRenderer:
    """
    Debug visualization system
    """
    
    def __init__(self, font: pygame.font.Font):
        self.font = font
        self.small_font = pygame.font.Font(None, 16)
        
        # Debug options
        self.show_velocity_vectors = True
        self.show_force_vectors = True
        self.show_bounding_boxes = True
        self.show_collision_normals = True
        self.show_spatial_hash = False
        self.show_physics_info = True
        
        # Colors
        self.velocity_color = (0, 255, 0)
        self.force_color = (255, 0, 0)
        self.bbox_color = (255, 255, 0)
        self.normal_color = (0, 255, 255)
        self.text_color = (255, 255, 255)
    
    def render_physics_body_debug(self, screen: pygame.Surface, body):
        """Render debug information for a physics body"""
        pos = body.position
        
        # Velocity vector
        if self.show_velocity_vectors and body.velocity.magnitude() > 1:
            vel_end = pos + body.velocity.normalize() * 30
            pygame.draw.line(screen, self.velocity_color, 
                           pos.to_int_tuple(), vel_end.to_int_tuple(), 2)
            # Arrow head
            arrow_angle = body.velocity.angle()
            for offset in [-0.5, 0.5]:
                arrow_tip = vel_end + Vector2D(
                    math.cos(arrow_angle + math.pi + offset) * 8,
                    math.sin(arrow_angle + math.pi + offset) * 8
                )
                pygame.draw.line(screen, self.velocity_color,
                               vel_end.to_int_tuple(), arrow_tip.to_int_tuple(), 2)
        
        # Force vectors
        if self.show_force_vectors and hasattr(body, 'accumulated_force'):
            if body.accumulated_force.magnitude() > 10:
                force_scale = min(50, body.accumulated_force.magnitude() / 100)
                force_end = pos + body.accumulated_force.normalize() * force_scale
                pygame.draw.line(screen, self.force_color,
                               pos.to_int_tuple(), force_end.to_int_tuple(), 2)
        
        # Bounding box
        if self.show_bounding_boxes:
            if hasattr(body, 'get_bounding_box'):
                bbox = body.get_bounding_box()
                pygame.draw.rect(screen, self.bbox_color, 
                               (bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]), 1)
        
        # Physics info text
        if self.show_physics_info:
            info_lines = [
                f"m: {body.mass:.1f}",
                f"v: {body.velocity.magnitude():.1f}",
                f"ω: {getattr(body, 'angular_velocity', 0):.1f}"
            ]
            
            for i, line in enumerate(info_lines):
                text_surface = self.small_font.render(line, True, self.text_color)
                screen.blit(text_surface, (pos.x + 20, pos.y - 10 + i * 12))
    
    def render_collision_debug(self, screen: pygame.Surface, manifold):
        """Render collision debug information"""
        if not manifold:
            return
        
        # Contact points
        for contact in manifold.contacts:
            pygame.draw.circle(screen, (255, 0, 255), contact.position.to_int_tuple(), 3)
        
        # Collision normal
        if self.show_collision_normals and manifold.contacts:
            contact = manifold.contacts[0]
            normal_end = contact.position + manifold.normal * 30
            pygame.draw.line(screen, self.normal_color,
                           contact.position.to_int_tuple(), normal_end.to_int_tuple(), 2)
    
    def render_spatial_hash_debug(self, screen: pygame.Surface, spatial_hash):
        """Render spatial hash grid"""
        if not self.show_spatial_hash:
            return
        
        cell_size = spatial_hash.cell_size
        
        # Draw grid lines
        for x in range(0, screen.get_width(), int(cell_size)):
            pygame.draw.line(screen, (50, 50, 50), (x, 0), (x, screen.get_height()))
        
        for y in range(0, screen.get_height(), int(cell_size)):
            pygame.draw.line(screen, (50, 50, 50), (0, y), (screen.get_width(), y))
        
        # Highlight occupied cells
        for cell_key, objects in spatial_hash.cells.items():
            if objects:
                cell_x, cell_y = cell_key
                screen_x = cell_x * cell_size
                screen_y = cell_y * cell_size
                
                # Draw filled rectangle with transparency
                cell_surface = pygame.Surface((cell_size, cell_size), pygame.SRCALPHA)
                cell_surface.fill((255, 255, 0, 50))
                screen.blit(cell_surface, (screen_x, screen_y))
                
                # Draw object count
                count_text = self.small_font.render(str(len(objects)), True, (255, 255, 255))
                screen.blit(count_text, (screen_x + 2, screen_y + 2))
    
    def render_performance_graph(self, screen: pygame.Surface, profiler: PerformanceProfiler):
        """Render performance graph"""
        graph_width = 200
        graph_height = 100
        graph_x = screen.get_width() - graph_width - 10
        graph_y = screen.get_height() - graph_height - 10
        
        # Background
        pygame.draw.rect(screen, (0, 0, 0, 128), (graph_x, graph_y, graph_width, graph_height))
        pygame.draw.rect(screen, (255, 255, 255), (graph_x, graph_y, graph_width, graph_height), 1)
        
        # Draw frame time graph
        if profiler.frame_times:
            max_time = max(profiler.frame_times)
            min_time = min(profiler.frame_times)
            time_range = max_time - min_time if max_time > min_time else 0.001
            
            points = []
            for i, frame_time in enumerate(profiler.frame_times):
                x = graph_x + (i / len(profiler.frame_times)) * graph_width
                y = graph_y + graph_height - ((frame_time - min_time) / time_range) * graph_height
                points.append((x, y))
            
            if len(points) > 1:
                pygame.draw.lines(screen, (0, 255, 0), False, points)
        
        # Labels
        fps_text = self.small_font.render(f"FPS: {profiler.get_fps():.1f}", True, (255, 255, 255))
        screen.blit(fps_text, (graph_x, graph_y - 15))


class OptimizationManager:
    """
    Performance optimization utilities
    """
    
    def __init__(self):
        self.level_of_detail_enabled = True
        self.frustum_culling_enabled = True
        self.adaptive_timestep_enabled = True
        self.multithread_physics_enabled = False
        
        # LOD settings
        self.lod_distance_threshold = 200
        self.lod_particle_threshold = 500
        
        # Adaptive timestep
        self.target_fps = 60
        self.min_timestep = 1.0 / 120.0
        self.max_timestep = 1.0 / 30.0
        
    def should_render_object(self, object_pos: Vector2D, camera_pos: Vector2D, screen_size: Tuple[int, int]) -> bool:
        """Determine if object should be rendered (frustum culling)"""
        if not self.frustum_culling_enabled:
            return True
        
        # Simple screen bounds check
        screen_bounds = pygame.Rect(
            camera_pos.x - screen_size[0] // 2,
            camera_pos.y - screen_size[1] // 2,
            screen_size[0],
            screen_size[1]
        )
        
        return screen_bounds.collidepoint(object_pos.to_int_tuple())
    
    def get_level_of_detail(self, object_pos: Vector2D, camera_pos: Vector2D) -> int:
        """Get level of detail for object rendering"""
        if not self.level_of_detail_enabled:
            return 0
        
        distance = (object_pos - camera_pos).magnitude()
        
        if distance < self.lod_distance_threshold:
            return 0  # High detail
        elif distance < self.lod_distance_threshold * 2:
            return 1  # Medium detail
        else:
            return 2  # Low detail
    
    def get_adaptive_timestep(self, current_fps: float) -> float:
        """Calculate adaptive timestep based on performance"""
        if not self.adaptive_timestep_enabled:
            return 1.0 / self.target_fps
        
        if current_fps < self.target_fps * 0.8:
            # Performance is poor, increase timestep
            timestep = 1.0 / max(current_fps, self.target_fps * 0.5)
        else:
            # Performance is good, use target timestep
            timestep = 1.0 / self.target_fps
        
        return max(self.min_timestep, min(self.max_timestep, timestep))
    
    def optimize_particle_count(self, current_count: int, target_fps: float, actual_fps: float) -> int:
        """Suggest optimal particle count based on performance"""
        if actual_fps < target_fps * 0.8:
            # Reduce particles
            return max(100, int(current_count * 0.8))
        elif actual_fps > target_fps * 1.2:
            # Can handle more particles
            return min(2000, int(current_count * 1.1))
        
        return current_count


# Global performance optimization settings
PERFORMANCE_SETTINGS = {
    'use_spatial_hashing': True,
    'use_broad_phase_collision': True,
    'use_sleeping_bodies': True,
    'max_collision_iterations': 10,
    'position_correction_threshold': 0.01,
    'velocity_threshold_for_sleep': 0.1,
    'angular_velocity_threshold_for_sleep': 0.1,
    'sleep_time_threshold': 1.0,
    'max_trail_points': 50,
    'particle_effect_budget': 1000,
    'adaptive_quality_enabled': True
}


def optimize_physics_bodies(bodies: List, camera_pos: Vector2D, screen_size: Tuple[int, int]):
    """
    Optimize physics bodies based on visibility and distance from camera
    """
    visible_bodies = []
    sleeping_bodies = []
    
    for body in bodies:
        # Distance-based optimization
        distance = (body.position - camera_pos).magnitude()
        
        # Frustum culling
        if is_in_screen_bounds(body.position, camera_pos, screen_size):
            visible_bodies.append(body)
            
            # Wake up if in view
            if hasattr(body, 'is_sleeping'):
                body.is_sleeping = False
        else:
            # Put distant bodies to sleep
            if hasattr(body, 'is_sleeping') and distance > 500:
                if body.velocity.magnitude() < PERFORMANCE_SETTINGS['velocity_threshold_for_sleep']:
                    body.is_sleeping = True
                    sleeping_bodies.append(body)
    
    return visible_bodies, sleeping_bodies


def is_in_screen_bounds(position: Vector2D, camera_pos: Vector2D, screen_size: Tuple[int, int]) -> bool:
    """Check if position is within screen bounds"""
    margin = 100  # Extra margin for objects partially visible
    
    left = camera_pos.x - screen_size[0] // 2 - margin
    right = camera_pos.x + screen_size[0] // 2 + margin
    top = camera_pos.y - screen_size[1] // 2 - margin
    bottom = camera_pos.y + screen_size[1] // 2 + margin
    
    return left <= position.x <= right and top <= position.y <= bottom

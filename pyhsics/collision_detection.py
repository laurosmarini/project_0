"""
Collision Detection System
Advanced collision detection for various shape types including circles, polygons, and pixel-perfect
"""

import math
import pygame
from typing import List, Optional, Tuple, Dict
from vector2d import Vector2D
from physics_body import PhysicsBody


class CollisionManifold:
    """
    Contains collision information between two bodies
    """
    
    def __init__(self, body_a: PhysicsBody, body_b: PhysicsBody):
        self.body_a = body_a
        self.body_b = body_b
        self.normal = Vector2D.zero()
        self.penetration = 0.0
        self.contact_points = []
        self.separation_velocity = 0.0
        self.is_colliding = False
        self.friction = math.sqrt(body_a.friction * body_b.friction)
        self.restitution = min(body_a.restitution, body_b.restitution)


class CollisionDetector:
    """
    Advanced collision detection system supporting multiple shape types
    """
    
    def __init__(self):
        self.collision_pairs = []
        self.broad_phase_enabled = True
        self.pixel_surfaces = {}  # Cache for pixel-perfect collision
    
    def detect_collision(self, body_a: PhysicsBody, body_b: PhysicsBody) -> Optional[CollisionManifold]:
        """
        Detect collision between two physics bodies
        
        Args:
            body_a: First physics body
            body_b: Second physics body
            
        Returns:
            CollisionManifold if collision detected, None otherwise
        """
        # Broad phase: AABB check first
        if self.broad_phase_enabled and not self._aabb_overlap(body_a, body_b):
            return None
        
        # Narrow phase: Shape-specific collision detection
        if body_a.body_type == "circle" and body_b.body_type == "circle":
            return self._circle_circle_collision(body_a, body_b)
        elif body_a.body_type == "circle" and body_b.body_type == "polygon":
            return self._circle_polygon_collision(body_a, body_b)
        elif body_a.body_type == "polygon" and body_b.body_type == "circle":
            manifold = self._circle_polygon_collision(body_b, body_a)
            if manifold:
                # Flip normal for correct direction
                manifold.normal = -manifold.normal
                manifold.body_a, manifold.body_b = manifold.body_b, manifold.body_a
            return manifold
        elif body_a.body_type == "polygon" and body_b.body_type == "polygon":
            return self._polygon_polygon_collision(body_a, body_b)
        elif body_a.body_type == "pixel" or body_b.body_type == "pixel":
            return self._pixel_perfect_collision(body_a, body_b)
        
        return None
    
    def _aabb_overlap(self, body_a: PhysicsBody, body_b: PhysicsBody) -> bool:
        """
        Check if two bodies' AABBs overlap
        """
        min_a, max_a = body_a.get_aabb()
        min_b, max_b = body_b.get_aabb()
        
        return not (max_a.x < min_b.x or max_b.x < min_a.x or 
                   max_a.y < min_b.y or max_b.y < min_a.y)
    
    def _circle_circle_collision(self, body_a: PhysicsBody, body_b: PhysicsBody) -> Optional[CollisionManifold]:
        """
        Circle-circle collision detection
        """
        distance_vec = body_b.position - body_a.position
        distance = distance_vec.magnitude
        radius_sum = body_a.radius + body_b.radius
        
        if distance < radius_sum and distance > 0:
            manifold = CollisionManifold(body_a, body_b)
            manifold.is_colliding = True
            manifold.normal = distance_vec.normalize()
            manifold.penetration = radius_sum - distance
            
            # Contact point is between the circles
            contact_point = body_a.position + manifold.normal * body_a.radius
            manifold.contact_points = [contact_point]
            
            return manifold
        
        return None
    
    def _circle_polygon_collision(self, circle: PhysicsBody, polygon: PhysicsBody) -> Optional[CollisionManifold]:
        """
        Circle-polygon collision detection using SAT
        """
        if not polygon.vertices:
            polygon.update_polygon_vertices()
        
        min_separation = float('-inf')
        separation_normal = Vector2D.zero()
        closest_vertex = Vector2D.zero()
        
        # Check each edge of the polygon
        for i in range(len(polygon.vertices)):
            j = (i + 1) % len(polygon.vertices)
            edge = polygon.vertices[j] - polygon.vertices[i]
            normal = edge.perpendicular().normalize()
            
            # Project circle center onto the normal
            to_circle = circle.position - polygon.vertices[i]
            separation = to_circle.dot(normal) - circle.radius
            
            if separation > 0:
                return None  # No collision
            
            if separation > min_separation:
                min_separation = separation
                separation_normal = normal
                closest_vertex = polygon.vertices[i]
        
        # Check if circle center is inside polygon
        if min_separation < 0:
            manifold = CollisionManifold(circle, polygon)
            manifold.is_colliding = True
            manifold.normal = -separation_normal
            manifold.penetration = -min_separation
            
            # Find contact point
            contact_point = circle.position - separation_normal * circle.radius
            manifold.contact_points = [contact_point]
            
            return manifold
        
        return None
    
    def _polygon_polygon_collision(self, body_a: PhysicsBody, body_b: PhysicsBody) -> Optional[CollisionManifold]:
        """
        Polygon-polygon collision detection using SAT (Separating Axis Theorem)
        """
        if not body_a.vertices:
            body_a.update_polygon_vertices()
        if not body_b.vertices:
            body_b.update_polygon_vertices()
        
        min_overlap = float('inf')
        separation_axis = Vector2D.zero()
        
        # Check axes from both polygons
        for polygon in [body_a, body_b]:
            for i in range(len(polygon.vertices)):
                j = (i + 1) % len(polygon.vertices)
                edge = polygon.vertices[j] - polygon.vertices[i]
                axis = edge.perpendicular().normalize()
                
                # Project both polygons onto the axis
                proj_a = self._project_polygon(body_a.vertices, axis)
                proj_b = self._project_polygon(body_b.vertices, axis)
                
                # Check for separation
                overlap = min(proj_a[1], proj_b[1]) - max(proj_a[0], proj_b[0])
                
                if overlap <= 0:
                    return None  # Separation found
                
                if overlap < min_overlap:
                    min_overlap = overlap
                    separation_axis = axis
        
        # Collision detected
        manifold = CollisionManifold(body_a, body_b)
        manifold.is_colliding = True
        manifold.penetration = min_overlap
        
        # Ensure normal points from A to B
        center_to_center = body_b.position - body_a.position
        if center_to_center.dot(separation_axis) < 0:
            separation_axis = -separation_axis
        
        manifold.normal = separation_axis
        
        # Find contact points (simplified - use closest vertices)
        manifold.contact_points = self._find_contact_points(body_a, body_b, manifold.normal)
        
        return manifold
    
    def _project_polygon(self, vertices: List[Vector2D], axis: Vector2D) -> Tuple[float, float]:
        """
        Project polygon vertices onto an axis
        
        Returns:
            Tuple of (min_projection, max_projection)
        """
        if not vertices:
            return (0.0, 0.0)
        
        min_proj = vertices[0].dot(axis)
        max_proj = min_proj
        
        for vertex in vertices[1:]:
            proj = vertex.dot(axis)
            min_proj = min(min_proj, proj)
            max_proj = max(max_proj, proj)
        
        return (min_proj, max_proj)
    
    def _find_contact_points(self, body_a: PhysicsBody, body_b: PhysicsBody, normal: Vector2D) -> List[Vector2D]:
        """
        Find contact points between two polygons
        """
        contact_points = []
        
        # Find the feature (edge or vertex) that's most parallel to the collision normal
        # This is a simplified version - a full implementation would be more complex
        
        # For now, return the center point between the two bodies
        center_point = (body_a.position + body_b.position) * 0.5
        contact_points.append(center_point)
        
        return contact_points
    
    def _pixel_perfect_collision(self, body_a: PhysicsBody, body_b: PhysicsBody) -> Optional[CollisionManifold]:
        """
        Pixel-perfect collision detection for irregular shapes
        """
        # First check if we have surfaces for these bodies
        surface_a = self.pixel_surfaces.get(id(body_a))
        surface_b = self.pixel_surfaces.get(id(body_b))
        
        if not surface_a or not surface_b:
            return None
        
        # Get the offset between the two surfaces
        offset_x = int(body_b.position.x - body_a.position.x)
        offset_y = int(body_b.position.y - body_a.position.y)
        
        # Check if the surfaces overlap
        rect_a = surface_a.get_rect()
        rect_b = surface_b.get_rect()
        rect_b.x += offset_x
        rect_b.y += offset_y
        
        if not rect_a.colliderect(rect_b):
            return None
        
        # Find the overlapping area
        overlap_rect = rect_a.clip(rect_b)
        
        # Check for pixel overlap in the overlapping area
        collision_point = None
        
        for x in range(overlap_rect.width):
            for y in range(overlap_rect.height):
                pixel_x = overlap_rect.x + x
                pixel_y = overlap_rect.y + y
                
                # Check if both surfaces have non-transparent pixels at this position
                if (pixel_x < surface_a.get_width() and pixel_y < surface_a.get_height() and
                    pixel_x - offset_x >= 0 and pixel_y - offset_y >= 0 and
                    pixel_x - offset_x < surface_b.get_width() and pixel_y - offset_y < surface_b.get_height()):
                    
                    pixel_a = surface_a.get_at((pixel_x, pixel_y))
                    pixel_b = surface_b.get_at((pixel_x - offset_x, pixel_y - offset_y))
                    
                    if pixel_a[3] > 0 and pixel_b[3] > 0:  # Both pixels are not transparent
                        collision_point = Vector2D(pixel_x, pixel_y)
                        break
            
            if collision_point:
                break
        
        if collision_point:
            manifold = CollisionManifold(body_a, body_b)
            manifold.is_colliding = True
            manifold.contact_points = [collision_point]
            
            # Calculate normal (simplified - use direction between centers)
            direction = body_b.position - body_a.position
            if direction.magnitude > 0:
                manifold.normal = direction.normalize()
            else:
                manifold.normal = Vector2D(1, 0)
            
            manifold.penetration = 1.0  # Simplified penetration depth
            
            return manifold
        
        return None
    
    def add_pixel_surface(self, body: PhysicsBody, surface: pygame.Surface) -> None:
        """
        Add a pixel surface for pixel-perfect collision detection
        
        Args:
            body: Physics body to associate with the surface
            surface: Pygame surface containing the pixel data
        """
        self.pixel_surfaces[id(body)] = surface
        body.body_type = "pixel"
    
    def remove_pixel_surface(self, body: PhysicsBody) -> None:
        """
        Remove pixel surface for a body
        """
        if id(body) in self.pixel_surfaces:
            del self.pixel_surfaces[id(body)]


class SpatialHash:
    """
    Spatial partitioning for efficient broad-phase collision detection
    """
    
    def __init__(self, cell_size: float = 100.0):
        self.cell_size = cell_size
        self.grid = {}
        self.bodies = set()
    
    def clear(self) -> None:
        """Clear the spatial hash"""
        self.grid.clear()
        self.bodies.clear()
    
    def insert(self, body: PhysicsBody) -> None:
        """Insert a body into the spatial hash"""
        self.bodies.add(body)
        
        min_pos, max_pos = body.get_aabb()
        
        min_x = int(min_pos.x // self.cell_size)
        max_x = int(max_pos.x // self.cell_size)
        min_y = int(min_pos.y // self.cell_size)
        max_y = int(max_pos.y // self.cell_size)
        
        for x in range(min_x, max_x + 1):
            for y in range(min_y, max_y + 1):
                cell = (x, y)
                if cell not in self.grid:
                    self.grid[cell] = set()
                self.grid[cell].add(body)
    
    def get_potential_collisions(self) -> List[Tuple[PhysicsBody, PhysicsBody]]:
        """
        Get list of potential collision pairs
        
        Returns:
            List of body pairs that might be colliding
        """
        potential_pairs = set()
        
        for cell_bodies in self.grid.values():
            if len(cell_bodies) > 1:
                bodies_list = list(cell_bodies)
                for i in range(len(bodies_list)):
                    for j in range(i + 1, len(bodies_list)):
                        body_a, body_b = bodies_list[i], bodies_list[j]
                        if not (body_a.is_static and body_b.is_static):
                            potential_pairs.add((body_a, body_b))
        
        return list(potential_pairs)
    
    def rebuild(self, bodies: List[PhysicsBody]) -> None:
        """Rebuild the spatial hash with new body positions"""
        self.clear()
        for body in bodies:
            self.insert(body)

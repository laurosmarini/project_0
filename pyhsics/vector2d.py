"""
2D Vector Mathematics Module for Physics Simulation
Provides comprehensive vector operations for physics calculations
"""

import math
from typing import Union, Tuple


class Vector2D:
    """
    2D Vector class with comprehensive mathematical operations
    """
    
    def __init__(self, x: float = 0.0, y: float = 0.0):
        self.x = float(x)
        self.y = float(y)
    
    # Basic operations
    def __add__(self, other: 'Vector2D') -> 'Vector2D':
        return Vector2D(self.x + other.x, self.y + other.y)
    
    def __sub__(self, other: 'Vector2D') -> 'Vector2D':
        return Vector2D(self.x - other.x, self.y - other.y)
    
    def __mul__(self, scalar: float) -> 'Vector2D':
        return Vector2D(self.x * scalar, self.y * scalar)
    
    def __rmul__(self, scalar: float) -> 'Vector2D':
        return self.__mul__(scalar)
    
    def __truediv__(self, scalar: float) -> 'Vector2D':
        if scalar == 0:
            raise ValueError("Cannot divide by zero")
        return Vector2D(self.x / scalar, self.y / scalar)
    
    def __neg__(self) -> 'Vector2D':
        return Vector2D(-self.x, -self.y)
    
    def __eq__(self, other: 'Vector2D') -> bool:
        return abs(self.x - other.x) < 1e-10 and abs(self.y - other.y) < 1e-10
    
    def __repr__(self) -> str:
        return f"Vector2D({self.x:.3f}, {self.y:.3f})"
    
    def __str__(self) -> str:
        return f"({self.x:.3f}, {self.y:.3f})"
    
    # Vector properties
    @property
    def magnitude(self) -> float:
        """Calculate the magnitude (length) of the vector"""
        return math.sqrt(self.x * self.x + self.y * self.y)
    
    @property
    def magnitude_squared(self) -> float:
        """Calculate the squared magnitude (faster than magnitude)"""
        return self.x * self.x + self.y * self.y
    
    @property
    def angle(self) -> float:
        """Get the angle of the vector in radians"""
        return math.atan2(self.y, self.x)
    
    # Vector operations
    def normalize(self) -> 'Vector2D':
        """Return a normalized version of this vector"""
        mag = self.magnitude
        if mag == 0:
            return Vector2D(0, 0)
        return Vector2D(self.x / mag, self.y / mag)
    
    def normalized(self) -> 'Vector2D':
        """Return a normalized copy of this vector"""
        return self.normalize()
    
    def dot(self, other: 'Vector2D') -> float:
        """Calculate dot product with another vector"""
        return self.x * other.x + self.y * other.y
    
    def cross(self, other: 'Vector2D') -> float:
        """Calculate cross product (scalar in 2D)"""
        return self.x * other.y - self.y * other.x
    
    def perpendicular(self) -> 'Vector2D':
        """Return perpendicular vector (rotated 90 degrees counterclockwise)"""
        return Vector2D(-self.y, self.x)
    
    def rotate(self, angle: float) -> 'Vector2D':
        """Rotate vector by angle in radians"""
        cos_a = math.cos(angle)
        sin_a = math.sin(angle)
        return Vector2D(
            self.x * cos_a - self.y * sin_a,
            self.x * sin_a + self.y * cos_a
        )
    
    def limit(self, max_magnitude: float) -> 'Vector2D':
        """Limit the magnitude of the vector"""
        if self.magnitude > max_magnitude:
            return self.normalize() * max_magnitude
        return Vector2D(self.x, self.y)
    
    def lerp(self, other: 'Vector2D', t: float) -> 'Vector2D':
        """Linear interpolation between this and another vector"""
        return self + (other - self) * t
    
    def distance_to(self, other: 'Vector2D') -> float:
        """Calculate distance to another vector"""
        return (other - self).magnitude
    
    def distance_squared_to(self, other: 'Vector2D') -> float:
        """Calculate squared distance to another vector"""
        return (other - self).magnitude_squared
    
    def reflect(self, normal: 'Vector2D') -> 'Vector2D':
        """Reflect vector across a normal"""
        return self - 2 * self.dot(normal) * normal
    
    def project(self, onto: 'Vector2D') -> 'Vector2D':
        """Project this vector onto another vector"""
        if onto.magnitude_squared == 0:
            return Vector2D(0, 0)
        return onto * (self.dot(onto) / onto.magnitude_squared)
    
    def reject(self, from_vec: 'Vector2D') -> 'Vector2D':
        """Reject this vector from another vector"""
        return self - self.project(from_vec)
    
    # Utility methods
    def copy(self) -> 'Vector2D':
        """Create a copy of this vector"""
        return Vector2D(self.x, self.y)
    
    def set(self, x: float, y: float) -> None:
        """Set the components of this vector"""
        self.x = float(x)
        self.y = float(y)
    
    def set_magnitude(self, magnitude: float) -> 'Vector2D':
        """Set the magnitude while preserving direction"""
        if self.magnitude == 0:
            return Vector2D(magnitude, 0)
        return self.normalize() * magnitude
    
    def to_tuple(self) -> Tuple[float, float]:
        """Convert to tuple"""
        return (self.x, self.y)
    
    def to_int_tuple(self) -> Tuple[int, int]:
        """Convert to integer tuple for drawing"""
        return (int(round(self.x)), int(round(self.y)))
    
    @classmethod
    def from_angle(cls, angle: float, magnitude: float = 1.0) -> 'Vector2D':
        """Create vector from angle and magnitude"""
        return cls(magnitude * math.cos(angle), magnitude * math.sin(angle))
    
    @classmethod
    def random(cls, min_val: float = -1.0, max_val: float = 1.0) -> 'Vector2D':
        """Create random vector"""
        import random
        return cls(
            random.uniform(min_val, max_val),
            random.uniform(min_val, max_val)
        )
    
    @classmethod
    def zero(cls) -> 'Vector2D':
        """Create zero vector"""
        return cls(0, 0)
    
    @classmethod
    def one(cls) -> 'Vector2D':
        """Create unit vector (1, 1)"""
        return cls(1, 1)
    
    @classmethod
    def up(cls) -> 'Vector2D':
        """Create up vector (0, -1) - negative Y is up in screen coordinates"""
        return cls(0, -1)
    
    @classmethod
    def down(cls) -> 'Vector2D':
        """Create down vector (0, 1)"""
        return cls(0, 1)
    
    @classmethod
    def left(cls) -> 'Vector2D':
        """Create left vector (-1, 0)"""
        return cls(-1, 0)
    
    @classmethod
    def right(cls) -> 'Vector2D':
        """Create right vector (1, 0)"""
        return cls(1, 0)


def clamp(value: float, min_val: float, max_val: float) -> float:
    """Clamp a value between min and max"""
    return max(min_val, min(value, max_val))


def lerp(a: float, b: float, t: float) -> float:
    """Linear interpolation between two values"""
    return a + (b - a) * t


def map_range(value: float, in_min: float, in_max: float, out_min: float, out_max: float) -> float:
    """Map a value from one range to another"""
    return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min


def sign(value: float) -> int:
    """Return the sign of a value"""
    if value > 0:
        return 1
    elif value < 0:
        return -1
    else:
        return 0

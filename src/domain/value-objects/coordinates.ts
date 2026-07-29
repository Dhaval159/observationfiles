export interface Coordinates2D {
  readonly x: number;
  readonly y: number;
  distanceTo(other: Coordinates2D): number;
  add(other: Coordinates2D): Coordinates2D;
  subtract(other: Coordinates2D): Coordinates2D;
  scale(factor: number): Coordinates2D;
  equals(other: Coordinates2D): boolean;
  normalize(): Coordinates2D;
}

export function createCoordinates2D(x: number, y: number): Coordinates2D {
  return {
    x,
    y,
    distanceTo(other: Coordinates2D): number {
      return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
    },
    add(other: Coordinates2D): Coordinates2D {
      return createCoordinates2D(this.x + other.x, this.y + other.y);
    },
    subtract(other: Coordinates2D): Coordinates2D {
      return createCoordinates2D(this.x - other.x, this.y - other.y);
    },
    scale(factor: number): Coordinates2D {
      return createCoordinates2D(this.x * factor, this.y * factor);
    },
    equals(other: Coordinates2D): boolean {
      return this.x === other.x && this.y === other.y;
    },
    normalize(): Coordinates2D {
      const dist = Math.sqrt(this.x ** 2 + this.y ** 2);
      if (dist === 0) return createCoordinates2D(0, 0);
      return createCoordinates2D(this.x / dist, this.y / dist);
    },
  };
}

export interface Coordinates3D extends Coordinates2D {
  readonly z: number;
  distanceTo(other: Coordinates3D): number;
  add(other: Coordinates3D): Coordinates3D;
  subtract(other: Coordinates3D): Coordinates3D;
  scale(factor: number): Coordinates3D;
  equals(other: Coordinates3D): boolean;
  normalize(): Coordinates3D;
}

export function createCoordinates3D(x: number, y: number, z: number): Coordinates3D {
  const base = createCoordinates2D(x, y);
  return {
    ...base,
    z,
    distanceTo(other: Coordinates3D): number {
      return Math.sqrt(
        (this.x - other.x) ** 2 + (this.y - other.y) ** 2 + (this.z - other.z) ** 2,
      );
    },
    add(other: Coordinates3D): Coordinates3D {
      return createCoordinates3D(this.x + other.x, this.y + other.y, this.z + other.z);
    },
    subtract(other: Coordinates3D): Coordinates3D {
      return createCoordinates3D(this.x - other.x, this.y - other.y, this.z - other.z);
    },
    scale(factor: number): Coordinates3D {
      return createCoordinates3D(this.x * factor, this.y * factor, this.z * factor);
    },
    equals(other: Coordinates3D): boolean {
      return this.x === other.x && this.y === other.y && this.z === other.z;
    },
    normalize(): Coordinates3D {
      const dist = Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
      if (dist === 0) return createCoordinates3D(0, 0, 0);
      return createCoordinates3D(this.x / dist, this.y / dist, this.z / dist);
    },
  };
}

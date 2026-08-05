namespace Battleship.Models;

public class Coord2D
{
    // X coordinate 
    public int X { get; }

    // Y coordinate
    public int Y { get; }

   
    public Coord2D(int x, int y)
    {
        X = x;
        Y = y;
    }

    public override bool Equals(object? obj)
    {
        if (obj is not Coord2D other)
            return false;

        return X == other.X && Y == other.Y;
    }

    
    public override int GetHashCode()
    {
        return HashCode.Combine(X, Y);
    }

    
    public override string ToString()
    {
        return $"({X},{Y})";
    }
}
using Battleship.Models;

namespace Battleship.Ships;

public class Submarine : Ship
{
    public Submarine(Coord2D position, DirectionType direction)
        : base(position, direction, 3)
    {
    }

    public override string GetName() => "Submarine";
}
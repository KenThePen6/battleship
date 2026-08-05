using Battleship.Models;

namespace Battleship.Ships;

public class Carrier : Ship
{
    public Carrier(Coord2D position, DirectionType direction)
        : base(position, direction, 5)
    {
    }

    public override string GetName() => "Carrier";
}
using Battleship.Models;

namespace Battleship.Ships;

public class Destroyer : Ship
{
    public Destroyer(Coord2D position, DirectionType direction)
        : base(position, direction, 3)
    {
    }

    public override string GetName() => "Destroyer";
}
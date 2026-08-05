using Battleship.Models;

namespace Battleship.Ships;

public class PatrolBoat : Ship
{
    public PatrolBoat(Coord2D position, DirectionType direction)
        : base(position, direction, 2)
    {
    }

    public override string GetName() => "Patrol Boat";
}
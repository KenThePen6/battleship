using Battleship.Models;

namespace Battleship.Ships;

public class Battleship : Ship
{
    public Battleship(Coord2D position, DirectionType direction)
        : base(position, direction, 4)
    {
    }

    public override string GetName() => "Battleship";
}
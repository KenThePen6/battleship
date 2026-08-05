using Battleship.Models;
using Battleship.Ships;

public class Game
{
    private Fleet fleet;

    public Game(Fleet fleet)
    {
        this.fleet = fleet;
    }

    public void FireAt(Coord2D target)
    {
        foreach (Ship ship in fleet.Ships)
        {
            if (ship.IsHit(target))
            {
                ship.ApplyDamage(target);

                Console.WriteLine($"Hit {ship.GetName()}!");

                if (ship.IsDead)
                    Console.WriteLine($"{ship.GetName()} sunk!");

                return;
            }
        }

        Console.WriteLine("Miss.");
    }   

    public void PrintInfo()
    {
        foreach (Ship ship in fleet.Ships)
        {
            Console.WriteLine(ship.GetInfo());
        }
    }

    public bool AllShipsSunk()
    {
        foreach (Ship ship in fleet.Ships)
        {
            if (!ship.IsDead)
                return false;
        }

        return true;
    }
}
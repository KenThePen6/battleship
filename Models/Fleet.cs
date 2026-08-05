using Battleship.Ships;
using Battleship.Factory;

namespace Battleship.Models;

public class Fleet
{

    public List<Ship> Ships { get; private set; }

    public Fleet()
    {
        Ships = new List<Ship>();
    }


    public void LoadFromFile(string filePath)
    {
        ShipFactory factory = new ShipFactory();


        string[] lines = File.ReadAllLines(filePath);

    foreach (string line in lines)
    {
        string trimmedLine = line.Trim();

        Console.WriteLine("Reading line: [" + trimmedLine + "]");

  
        if (string.IsNullOrEmpty(trimmedLine))
         continue;

        if (trimmedLine.StartsWith("#"))
        continue;

        Ship ship = factory.CreateShip(trimmedLine);
        Ships.Add(ship);
    }
}

    public void PrintFleet()
    {
        foreach (Ship ship in Ships)
        {
            Console.WriteLine(ship.GetInfo());
        }
    }
}
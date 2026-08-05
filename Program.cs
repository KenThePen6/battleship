using Battleship.Models;

class Program
{
    static void Main(string[] args)
    {
        string filePath;

        if (args.Length > 0)
        {
            filePath = args[0];
        }
        else
        {
            Console.Write("Enter fleet file path: ");
            filePath = Console.ReadLine() ?? "";
        }

        Fleet fleet = new Fleet();

        try
        {
            fleet.LoadFromFile(filePath); 

        }
        catch (Exception ex)
        {
            Console.WriteLine("Error loading fleet: " + ex.Message);
            return;
        }

        Game game = new Game(fleet);

        Console.WriteLine("\nFleet loaded! Start firing at coordinates.\n");


        while (true)
        {

            if (game.AllShipsSunk())
            {
                Console.WriteLine("All ships sunk! Game over.");
                break;
            }

            Console.Write("Please enter coordinates in X,Y format (0-9), or type 'info' or 'exit': ");
            string? input = Console.ReadLine();

            if (input == null)
                break;

            input = input.Trim();

            if (input.ToLower() == "exit")
                break;


            if (input.ToLower() == "info")
            {
                game.PrintInfo();
                continue;
            }


            string[] parts = input.Split(',');

            if (parts.Length == 2 &&
                int.TryParse(parts[0], out int x) &&
                int.TryParse(parts[1], out int y))
            {
                if (x < 0 || x > 9 || y < 0 || y > 9)
                {
                    Console.WriteLine("Coordinates must be between 0 and 9.\n");
                    continue;
                }

                Coord2D shot = new Coord2D(x, y);
                game.FireAt(shot); 
            }
            else
            {
                Console.WriteLine("Command not recognized.\n");
            }
        }
    }
}
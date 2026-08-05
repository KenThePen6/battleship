namespace Battleship.Models;

public interface IHealth
{
    int MaxHealth { get; }
    int CurrentHealth { get; set; }
    bool IsSunk { get; }
} 


using Battleship.Models;
using System.Collections.Generic;
using System.Linq;

namespace Battleship.Models;

public abstract class Ship : IHealth, IInformatic
{

    protected Coord2D Position;

    protected DirectionType Direction;

    protected int Length;


    protected List<Coord2D> OccupiedPoints;


    protected HashSet<Coord2D> DamagedPoints;

    protected Ship(Coord2D position, DirectionType direction, int length)
    {
        Position = position;
        Direction = direction;
        Length = length;

        OccupiedPoints = new List<Coord2D>();
        DamagedPoints = new HashSet<Coord2D>();

        GenerateOccupiedPoints();
    }

    private void GenerateOccupiedPoints()
    {
        for (int i = 0; i < Length; i++)
        {
            int x = Position.X;
            int y = Position.Y;

            if (Direction == DirectionType.Horizontal)
            {
                x += i;
            }
            else // Vertical
            {
                y += i;
            }

            OccupiedPoints.Add(new Coord2D(x, y));
        }
    }


    public bool IsHit(Coord2D shot)
    {
        return OccupiedPoints.Contains(shot);
    }


    public void ApplyDamage(Coord2D shot)
    {

        DamagedPoints.Add(shot);
    }


    public int MaxHealth => Length;


    public int CurrentHealth
    {
        get => Length - DamagedPoints.Count;
        set
        {
            throw new System.NotSupportedException("CurrentHealth is read-only.");
        }
    }

    public bool IsDead => CurrentHealth <= 0;

    public bool IsSunk => IsDead;

    public abstract string GetName();

    public string GetInfo()
    {
        string status = IsDead ? "Dead" : "Alive";

        return $"{GetName()} (Length {Length}) at {Position} {Direction} | " +
               $"HP {CurrentHealth}/{MaxHealth} | {status}.";
    }
}
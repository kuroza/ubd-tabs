using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DotNetAngularApp.Core.Models
{
    [Table("Bookings")]
    public class Booking
    {
        public int Id { get; set; }

        [Required]
        public int RoomId { get; set; } // ! change to collection of Rooms

        public Room Room { get; set; }

        [Required]
        public DateTime BookDate { get; set; } // ! change to collection of BookDate

        [Required]
        public ICollection<BookingTimeSlot> TimeSlots { get; set; }

        [Required]
        public ICollection<BookingModule> Modules { get; set; }

        [Required]
        public int SemesterId { get; set; }

        public Semester Semester { get; set; }

        public Booking()
        {
            TimeSlots = new Collection<BookingTimeSlot>();
            Modules = new Collection<BookingModule>();
        }
    }
}
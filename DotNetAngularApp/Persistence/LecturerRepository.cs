using System.Collections.Generic;
using System.Threading.Tasks;
using DotNetAngularApp.Core;
using DotNetAngularApp.Core.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace DotNetAngularApp.Persistence
{
    public class LecturerRepository : ILecturerRepository
    {
        private readonly TabsDbContext context;
        public LecturerRepository(TabsDbContext context)
        {
            this.context = context;
        }

        public async Task<IEnumerable<Lecturer>> GetAllLecturers()
        {
            return await context.Lecturers
                .OrderBy(l => l.Name)
                .ToListAsync();
        }

        public async Task<Lecturer> GetLecturer(int id, bool includeRelated = true)
        {
            if (!includeRelated)
                return await context.Lecturers.FindAsync(id);

            return await context.Lecturers.SingleOrDefaultAsync(l => l.Id == id);
        }

        public void Add(Lecturer lecturer)
        {
            context.Lecturers.Add(lecturer);
        }

        public void Remove(Lecturer lecturer)
        {
            context.Remove(lecturer);
        }

        public async Task<Lecturer> LecturerNameExist(Lecturer lecturer)
        {
            return await context.Lecturers.FirstOrDefaultAsync(l => l.Name == lecturer.Name);
        }

        public async Task<Lecturer> EditLecturerExist(Lecturer lecturer)
        {
            return await context.Lecturers.FirstOrDefaultAsync(l => l.Name == lecturer.Name && l.Id != lecturer.Id);
        }
    }
}
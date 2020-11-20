using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace DotNetAngularApp.Controllers.Resources
{
    public class LecturerDetailsResource
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Title { get; set; }
        public string Email { get; set; }
        public ICollection<ModuleResource> Modules { get; set; }
        public LecturerDetailsResource()
        {
            Modules = new Collection<ModuleResource>();
        }
    }
}
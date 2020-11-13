using System.Linq;
using AutoMapper;
using DotNetAngularApp.Controllers.Resources;
using DotNetAngularApp.Core.Models;

namespace DotNetAngularApp.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Domain to API Resource
            // <Source, target>
            CreateMap(typeof(QueryResult<>), typeof(QueryResultResource<>));
            CreateMap<Faculty, FacultyResource>();
            CreateMap<Major, MajorResource>();
            
            CreateMap<TimeSlot, TimeSlotResource>();
            CreateMap<TimeSlot, SaveTimeSlotResource>();
            
            CreateMap<Room, RoomResource>()
                .ForMember(rr => rr.Building, opt => opt.MapFrom(r => r.Building));
            CreateMap<Room, SaveRoomResource>();

            CreateMap<Lecturer, LecturerResource>();
            CreateMap<Lecturer, SaveLecturerResource>();

            CreateMap<Building, KeyValuePairResource>();
            CreateMap<Building, BuildingResource>();
            CreateMap<Building, SaveBuildingResource>();

            CreateMap<Semester, SemesterResource>();
            CreateMap<Semester, SaveSemesterResource>();

            CreateMap<Booking, SaveBookingResource>()
                .ForMember(br => br.TimeSlots, opt => opt.MapFrom(b => b.TimeSlots.Select(bt => bt.TimeSlotId)))
                .ForMember(br => br.Modules, opt => opt.MapFrom(b => b.Modules.Select(bt => bt.ModuleId)));

            CreateMap<Booking, BookingResource>()
                .ForMember(br => br.SemesterId, opt => opt.MapFrom(b => b.Semester.Id)) // !
                .ForMember(br => br.Building, opt => opt.MapFrom(b => b.Rooms.Select(br => br.Room.Building)))
                .ForMember(br => br.TimeSlots, opt => 
                    opt.MapFrom(b => b.TimeSlots.Select(bt => 
                    new TimeSlotResource { Id = bt.TimeSlot.Id, StartTime = bt.TimeSlot.StartTime, EndTime = bt.TimeSlot.EndTime }))) //load the association class
                .ForMember(br => br.Modules, opt => 
                    opt.MapFrom(b => b.Modules.Select(bm => 
                    new ModuleResource { Id = bm.Module.Id, Name = bm.Module.Name, Code = bm.Module.Code, 
                        Major = new MajorResource { Id = bm.Module.Major.Id, Name = bm.Module.Major.Name, 
                        ShortName = bm.Module.Major.ShortName, FacultyId = bm.Module.Major.FacultyId },
                        Lecturers = bm.Module.Lecturers.Select(ml => 
                        new LecturerResource { Id = ml.Lecturer.Id, Name = ml.Lecturer.Name, Title = ml.Lecturer.Title }).ToList() })));

            CreateMap<Module, SaveModuleResource>()
                .ForMember(mr => mr.Lecturers, opt => opt.MapFrom(m => m.Lecturers.Select(ml => ml.LecturerId)));
                
            CreateMap<Module, ModuleResource>()
                .ForMember(mr => mr.Lecturers, opt => 
                    opt.MapFrom(m => m.Lecturers.Select(ml => 
                    new LecturerResource { Id = ml.Lecturer.Id, Name = ml.Lecturer.Name, Title = ml.Lecturer.Title })))
                .ForMember(mr => mr.Major, opt => opt.MapFrom(m => m.Major));

            // API Resource to Domain, saving to database
            CreateMap<BookingQueryResource, BookingQuery>();

            CreateMap<SaveFacultyResource, Faculty>()
                .ForMember(f => f.Id, opt => opt.Ignore());

            CreateMap<SaveMajorResource, Major>()
                .ForMember(p => p.Id, opt => opt.Ignore());

            CreateMap<SaveRoomResource, Room>()
                .ForMember(r => r.Id, opt => opt.Ignore());
            
            CreateMap<SaveLecturerResource, Lecturer>()
                .ForMember(l => l.Id, opt => opt.Ignore());

            CreateMap<SaveTimeSlotResource, TimeSlot>()
                .ForMember(t => t.Id, opt => opt.Ignore());

            CreateMap<SaveModuleResource, Module>()
                .ForMember(m => m.Id, opt => opt.Ignore())
                .ForMember(m => m.Lecturers, opt => opt.Ignore())
                .AfterMap((mr, m) => {
                    var removedLecturers = m.Lecturers.Where(l => !mr.Lecturers.Contains(l.LecturerId)).ToList();
                    foreach (var l in removedLecturers)
                        m.Lecturers.Remove(l);

                    var addedLecturers = mr.Lecturers
                        .Where(id => !m.Lecturers.Any(l => l.LecturerId == id))
                        .Select(id => new ModuleLecturer { LecturerId = id });
                    foreach (var l in addedLecturers)
                        m.Lecturers.Add(l);
                });

            CreateMap<SaveBuildingResource, Building>()
                .ForMember(b => b.Id, opt => opt.Ignore());

            CreateMap<SaveSemesterResource, Semester>()
                .ForMember(s => s.Id, opt => opt.Ignore());

            CreateMap<SaveBookingResource, Booking>()
                .ForMember(b => b.Id, opt => opt.Ignore())
                .ForMember(b => b.TimeSlots, opt => opt.Ignore())
                .AfterMap((br, b) => {
                    var removedTimeSlots = b.TimeSlots.Where(t => !br.TimeSlots.Contains(t.TimeSlotId)).ToList();
                    foreach (var t in removedTimeSlots)
                        b.TimeSlots.Remove(t);

                    var addedTimeSlots = br.TimeSlots
                        .Where(id => !b.TimeSlots.Any(t => t.TimeSlotId == id))
                        .Select(id => new BookingTimeSlot { TimeSlotId = id });
                    foreach (var t in addedTimeSlots)
                        b.TimeSlots.Add(t);
                })
                .ForMember(b => b.Modules, opt => opt.Ignore())
                .AfterMap((br, b) => {
                    var removedModules = b.Modules.Where(m => !br.Modules.Contains(m.ModuleId)).ToList();
                    foreach (var m in removedModules)
                        b.Modules.Remove(m);

                    var addedModules = br.Modules
                        .Where(id => !b.Modules.Any(m => m.ModuleId == id))
                        .Select(id => new BookingModule { ModuleId = id });
                    foreach (var m in addedModules)
                        b.Modules.Add(m);
                });
        }
    }
}
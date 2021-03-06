export interface Lecturer {
    id: number;
    name: string;
    title: string;
    email: string;
    lecturerNameAndTitle: string;
    modules: {
        id: number;
        name: string;
        code: string;
    }[];
    // facultyId: number;
}

export interface SaveLecturer {
    id: number;
    name: string;
    title: string;
    email: string;
    // facultyId: number;
}
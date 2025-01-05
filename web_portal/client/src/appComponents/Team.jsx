import { Github, Linkedin, Mail, Twitter } from 'lucide-react';
import { Card } from '../components/ui/card';

export default function Team() {
  const mentors = [
    {
      name: "Mr. Navneet Vishnoi",
      role: "Project Mentor",
      department: "Department of Management Studies",
      image: "https://images.unsplash.com/photo-1613742743080-a59851f3008d?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      bio: "Masters of Business Administration (MBA) in Marketing and Finance from TIMIT, Moradabad.",
      social: {
        email: "navneet.computers@tmu.ac.in",
        linkedin: "navneet-vishnoi-5b078519",
      }
    },
  ];

  const developers = [
    {
      name: "Anshika Saxena",
      role: "Data Analyst & Developer",
      image: "https://avatars.githubusercontent.com/u/123889589?v=4",
      skills: ["Python", "Flask", "Pandas", "Numpy", "AWS", "Github"],
      social: {
        email: "anshikasaxena2811@gmail.com",
        linkedin: "anshikasaxena2811",
        github: "anshikasaxena2811",
      }
    },
    {
      name: "Kushagra Katiha",
      role: "Full Stack Developer",
      image: "https://avatars.githubusercontent.com/u/116267840?v=4",
      skills: ["React", "Node.js", "JavaScript", "Tailwind CSS", "Github", "AWS"],
      social: {
        email: "kusahgrakatiha123@gmail.com",
        linkedin: "kushagrakatiha",
        github: "KushagraKatiha",
      }
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
           {/* Developers Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12">Development Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {developers.map((dev, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="text-center mb-4">
                  <img
                    src={dev.image}
                    alt={dev.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover mb-4"
                  />
                  <h3 className="text-xl font-semibold">{dev.name}</h3>
                  <p className="text-blue-600">{dev.role}</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {dev.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex justify-center space-x-4">
                  <a href={`mailto:${dev.social.email}`} className="text-gray-600 hover:text-blue-600">
                    <Mail className="h-5 w-5" />
                  </a>
                  <a href={`https://linkedin.com/in/${dev.social.linkedin}`} className="text-gray-600 hover:text-blue-600">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href={`https://github.com/${dev.social.github}`} className="text-gray-600 hover:text-blue-600">
                    <Github className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

       {/* Mentors Section */}
       <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mt-12 mb-12">Our Mentors</h2>
        <div className="flex flex-col w-full justify-center items-center gap-8">
          {mentors.map((mentor, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center space-x-6">
                  <img
                    src={mentor.image}
                    alt={mentor.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{mentor.name}</h3>
                    <p className="text-blue-600">{mentor.role}</p>
                    <p className="text-gray-600">{mentor.department}</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">{mentor.bio}</p>
                <div className="mt-4 flex space-x-4">
                  <a href={`mailto:${mentor.social.email}`} className="text-gray-600 hover:text-blue-600">
                    <Mail className="h-5 w-5" />
                  </a>
                  <a href={`https://linkedin.com/in/${mentor.social.linkedin}`} className="text-gray-600 hover:text-blue-600">
                    <Linkedin className="h-5 w-5" />
                  </a>
                 
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
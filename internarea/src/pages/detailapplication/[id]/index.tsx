import axios from "axios";
import { Building2, Calendar, FileText, Loader2, User } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const index = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setloading] = useState(false);
  const [data, setdata] = useState<any>([]);
  useEffect(() => {
    const fetchdata = async () => {
      try {
        setloading(true);
        const res = await axios.get(
          `https://internshala-clone-xhqv.onrender.com/api/application/${id}`
        );
        console.log(res.data);
        setdata(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    if (id) {
      fetchdata();
    }
  }, [id]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">
          Loading application details...
        </span>
      </div>
    );
  }
  return (
  <div className="min-h-screen bg-gray-50 py-12">
    <section key={data._id} className="max-w-6xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Image Section */}
          <div className="relative bg-gray-100 flex items-center justify-center">
            {data?.user?.photo ? (
              <img
                alt="Applicant photo"
                className="w-full h-full object-contain max-h-[450px]"
                src={data.user.photo}
              />
            ) : (
              <span className="text-gray-400">No Photo</span>
            )}

            {data.status && (
              <div
                className={`absolute top-4 right-4 px-4 py-1 rounded-full text-sm font-semibold ${
                  data.status === "accepted"
                    ? "bg-green-100 text-green-600"
                    : data.status === "rejected"
                    ? "bg-red-100 text-red-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {data.status}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-8 space-y-8">
            
            {/* Company */}
            <div>
              <div className="flex items-center mb-2">
                <Building2 className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-sm font-medium text-gray-500">Company</h2>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {data.company}
              </h1>
            </div>

            {/* Cover Letter */}
            <div>
              <div className="flex items-center mb-2">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-sm font-medium text-gray-500">
                  Cover Letter
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {data.coverLetter}
              </p>
            </div>

            {/* Attached Resume */}
            {data.resume && (
              <div>
                <div className="flex items-center mb-3">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-sm font-medium text-gray-500">
                    Attached Resume
                  </h2>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                  <p><b>Name:</b> {data.resume.name}</p>
                  <p><b>Email:</b> {data.resume.email}</p>
                  <p><b>Qualification:</b> {data.resume.qualification}</p>
                  <p><b>Skills:</b> {data.resume.skills}</p>
                  <p><b>About:</b> {data.resume.about}</p>
                  <p><b>Professional Details:</b> {data.resume.professional}</p>

                  {data.resume.photo && (
                    <img
                      src={data.resume.photo}
                      alt="Resume photo"
                      className="w-24 h-24 mt-3 rounded object-cover"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Footer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t">
              <div>
                <div className="flex items-center mb-1">
                  <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-500">
                    Application Date
                  </span>
                </div>
                <p className="text-gray-900 font-semibold">
                  {new Date(data.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div>
                <div className="flex items-center mb-1">
                  <User className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-500">
                    Applied By
                  </span>
                </div>
                <p className="text-gray-900 font-semibold">
                  {data.user?.name}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  </div>
);
}
export default index;
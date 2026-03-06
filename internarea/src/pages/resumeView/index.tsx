import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";


const ResumeView = () => {
  const user = useSelector((state: any) => state.user.user);
  const [resume, setResume] = useState<any>(null);


  useEffect(() => {
    if (!user?.uid) return;

    fetch(`https://internshala-clone-xhqv.onrender.com/api/resume/my?uid=${user.uid}`)
      .then(res => res.json())
      .then(data => setResume(data));
  }, [user?.uid]);

  const saveToProfile = async () => {
    try {
      await fetch("https://internshala-clone-xhqv.onrender.com/api/user/save-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          resumeId: resume._id
        })
      });

      toast.success("Resume saved to profile ✅");
    } catch (error) {
      toast.error("Failed to save resume ❌");
    }
  };

  const enableAutoAdd = async () => {
    try{
    await fetch("https://internshala-clone-xhqv.onrender.com/api/application/auto-attach-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid })
    });

     toast.success("Resume will be auto-added to applications 🚀");
  } catch (error) {
    toast.error("Failed to enable auto-add ❌");
  }
};

  if (!resume) return <p>Loading resume...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white">
      <h1 className="text-2xl font-bold">{resume.name}</h1>
      <p>{resume.email} | {resume.phone}</p>

      <hr className="my-4" />

      <h2 className="font-semibold">Qualification</h2>
      <p>{resume.qualification}</p>

      <h2 className="font-semibold mt-4">Skills</h2>
      <p>{resume.skills}</p>

      <h2 className="font-semibold mt-4">About</h2>
      <p>{resume.about}</p>

      <h2 className="font-semibold mt-4">Professional Details</h2>
      <p>{resume.professional}</p>

      <h2 className="font-semibold mt-4">Photo</h2>
      <p>{resume.photo}</p>

      <div className="flex gap-4 mt-6">
        <button
          onClick={saveToProfile}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save to Profile
        </button>

        <button
          onClick={enableAutoAdd}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Auto-add to Applications
        </button>
      </div>
    </div>
  );
};

export default ResumeView;

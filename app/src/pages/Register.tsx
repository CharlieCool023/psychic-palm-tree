import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check, Upload, Plus, X, Loader2, AlertTriangle } from "lucide-react";
import { trpc } from "@/providers/trpc";

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara",
];

interface Institution {
  name: string;
  startDate: string;
  endDate: string;
}

interface FormData {
  passportPhoto: string;
  surname: string;
  otherNames: string;
  changedName: boolean;
  formerName: string;
  state: string;
  stateCode: string;
  callUpNumber: string;
  phoneNumber: string;
  stateOfOrigin: string;
  stateOfDeployment: string;
  qualification: string;
  areaOfSpecialization: string;
  platoon: number;
  campExperienceComment: string;
  higherInstitutions: Institution[];
}

const initialFormData: FormData = {
  passportPhoto: "",
  surname: "",
  otherNames: "",
  changedName: false,
  formerName: "",
  state: "",
  stateCode: "",
  callUpNumber: "",
  phoneNumber: "",
  stateOfOrigin: "",
  stateOfDeployment: "",
  qualification: "",
  areaOfSpecialization: "",
  platoon: 1,
  campExperienceComment: "",
  higherInstitutions: [{ name: "", startDate: "", endDate: "" }],
};

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const { data: activeBatch } = trpc.batches.getActive.useQuery();
  const registerMutation = trpc.corpsMembers.register.useMutation({
    onSuccess: () => setStep(4),
    onError: (err) => setErrors({ submit: err.message }),
  });

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.surname.trim()) newErrors.surname = "Surname is required";
    if (!formData.otherNames.trim()) newErrors.otherNames = "Other names are required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.stateCode.trim()) newErrors.stateCode = "State code is required";
    else if (!/^(OD|LA)\/\d{2}C\/\d{4}$/i.test(formData.stateCode)) {
      newErrors.stateCode = "Format: OD/25C/XXXX or LA/25C/XXXX";
    }
    if (!formData.callUpNumber.trim()) newErrors.callUpNumber = "Call-up number is required";
    else if (!/^NYSC\/\w+\/\d{4}\/\d+$/i.test(formData.callUpNumber)) {
      newErrors.callUpNumber = "Format: NYSC/XXX/2025/XXXXX";
    }
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    else if (!/^(\+234|0)\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Must start with +234 or 0, 11 digits total";
    }
    if (!formData.stateOfOrigin) newErrors.stateOfOrigin = "State of origin is required";
    if (!formData.stateOfDeployment) newErrors.stateOfDeployment = "State of deployment is required";
    if (!formData.qualification.trim()) newErrors.qualification = "Qualification is required";
    if (!formData.areaOfSpecialization.trim()) newErrors.areaOfSpecialization = "Area of specialization is required";
    if (!formData.platoon) newErrors.platoon = "Platoon is required";

    if (formData.changedName && !formData.formerName.trim()) {
      newErrors.formerName = "Former name is required when checked";
    }

    if (formData.campExperienceComment && formData.campExperienceComment.length > 1000) {
      newErrors.campExperienceComment = "Max 1000 characters";
    }

    const invalidInst = formData.higherInstitutions.find(
      (inst) => !inst.name.trim() || !inst.startDate || !inst.endDate
    );
    if (invalidInst) {
      newErrors.institutions = "All institution fields are required";
    }
    const invalidDate = formData.higherInstitutions.find(
      (inst) => inst.startDate && inst.endDate && new Date(inst.startDate) >= new Date(inst.endDate)
    );
    if (invalidDate) {
      newErrors.institutionDates = "Start date must be before end date";
    }
    const futureDate = formData.higherInstitutions.find(
      (inst) => inst.endDate && new Date(inst.endDate) > new Date()
    );
    if (futureDate) {
      newErrors.institutionFuture = "End date cannot be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ photo: "Image must be under 5MB" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        const maxWidth = 400;
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.7);
        setPhotoPreview(compressed);
        setFormData((prev) => ({ ...prev, passportPhoto: compressed }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    setPhotoFile(file);
  };

  const addInstitution = () => {
    setFormData((prev) => ({
      ...prev,
      higherInstitutions: [...prev.higherInstitutions, { name: "", startDate: "", endDate: "" }],
    }));
  };

  const removeInstitution = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      higherInstitutions: prev.higherInstitutions.filter((_, i) => i !== index),
    }));
  };

  const updateInstitution = (index: number, field: keyof Institution, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.higherInstitutions];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, higherInstitutions: updated };
    });
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const payload = {
      passportPhoto: formData.passportPhoto || undefined,
      surname: formData.surname,
      otherNames: formData.otherNames,
      formerName: formData.changedName ? formData.formerName : undefined,
      stateCode: formData.stateCode.toUpperCase(),
      callUpNumber: formData.callUpNumber.toUpperCase(),
      phoneNumber: formData.phoneNumber,
      stateOfOrigin: formData.stateOfOrigin,
      stateOfDeployment: formData.stateOfDeployment as "ondo" | "lagos",
      qualification: formData.qualification,
      areaOfSpecialization: formData.areaOfSpecialization,
      platoon: formData.platoon,
      campExperienceComment: formData.campExperienceComment || undefined,
      higherInstitutions: formData.higherInstitutions.map((inst) => ({
        name: inst.name,
        startDate: inst.startDate,
        endDate: inst.endDate,
      })),
    };
    registerMutation.mutate(payload);
  };

  if (!activeBatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#004d00] via-[#006600] to-[#003300] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Closed</h2>
          <p className="text-gray-600 mb-6">
            There is no active orientation batch at the moment. Please check back later.
          </p>
          <Button onClick={() => navigate("/")} className="bg-[#004d00] hover:bg-[#003300]">
            Return Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004d00] via-[#006600] to-[#003300] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate("/")} className="flex items-center text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </button>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  s <= step ? "bg-white text-[#004d00]" : "bg-white/20 text-white/60"
                }`}
              >
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Corps Member Registration</h2>
              <p className="text-gray-600 mb-6">Step 1: Personal Information</p>

              <div className="space-y-4">
                <div>
                  <Label>Passport Photo</Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-[#004d00] hover:bg-gray-50 transition-colors"
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg mx-auto" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Click to upload passport photo</p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                  {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="surname">Surname</Label>
                    <Input
                      id="surname"
                      value={formData.surname}
                      onChange={(e) => setFormData((prev) => ({ ...prev, surname: e.target.value.toUpperCase() }))}
                      placeholder="Enter surname"
                      className="mt-1"
                    />
                    {errors.surname && <p className="text-red-500 text-sm mt-1">{errors.surname}</p>}
                  </div>
                  <div>
                    <Label htmlFor="otherNames">Other Names</Label>
                    <Input
                      id="otherNames"
                      value={formData.otherNames}
                      onChange={(e) => setFormData((prev) => ({ ...prev, otherNames: e.target.value.toUpperCase() }))}
                      placeholder="Enter other names"
                      className="mt-1"
                    />
                    {errors.otherNames && <p className="text-red-500 text-sm mt-1">{errors.otherNames}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="changedName"
                    checked={formData.changedName}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, changedName: checked === true }))
                    }
                  />
                  <Label htmlFor="changedName" className="cursor-pointer">I changed my name</Label>
                </div>

                {formData.changedName && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <Label htmlFor="formerName">Former Name</Label>
                    <Input
                      id="formerName"
                      value={formData.formerName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, formerName: e.target.value.toUpperCase() }))}
                      placeholder="Enter former name"
                      className="mt-1"
                    />
                    {errors.formerName && <p className="text-red-500 text-sm mt-1">{errors.formerName}</p>}
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select value={formData.state} onValueChange={(v) => setFormData((prev) => ({ ...prev, state: v }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ondo">Ondo</SelectItem>
                        <SelectItem value="lagos">Lagos</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <Label htmlFor="stateCode">State Code</Label>
                    <Input
                      id="stateCode"
                      value={formData.stateCode}
                      onChange={(e) => setFormData((prev) => ({ ...prev, stateCode: e.target.value.toUpperCase() }))}
                      placeholder="OD/25C/XXXX"
                      className="mt-1"
                    />
                    {errors.stateCode && <p className="text-red-500 text-sm mt-1">{errors.stateCode}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="callUpNumber">NYSC Call-up Number</Label>
                    <Input
                      id="callUpNumber"
                      value={formData.callUpNumber}
                      onChange={(e) => setFormData((prev) => ({ ...prev, callUpNumber: e.target.value.toUpperCase() }))}
                      placeholder="NYSC/XXX/2025/XXXXX"
                      className="mt-1"
                    />
                    {errors.callUpNumber && <p className="text-red-500 text-sm mt-1">{errors.callUpNumber}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="+234XXXXXXXXXX"
                      className="mt-1"
                    />
                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stateOfOrigin">State of Origin</Label>
                    <Select value={formData.stateOfOrigin} onValueChange={(v) => setFormData((prev) => ({ ...prev, stateOfOrigin: v }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {nigerianStates.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.stateOfOrigin && <p className="text-red-500 text-sm mt-1">{errors.stateOfOrigin}</p>}
                  </div>
                  <div>
                    <Label htmlFor="stateOfDeployment">State of Deployment</Label>
                    <Select value={formData.stateOfDeployment} onValueChange={(v) => setFormData((prev) => ({ ...prev, stateOfDeployment: v as "ondo" | "lagos" }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ondo">Ondo</SelectItem>
                        <SelectItem value="lagos">Lagos</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.stateOfDeployment && <p className="text-red-500 text-sm mt-1">{errors.stateOfDeployment}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="qualification">Qualification</Label>
                    <Input
                      id="qualification"
                      value={formData.qualification}
                      onChange={(e) => setFormData((prev) => ({ ...prev, qualification: e.target.value }))}
                      placeholder="e.g., B.Sc, HND"
                      className="mt-1"
                    />
                    {errors.qualification && <p className="text-red-500 text-sm mt-1">{errors.qualification}</p>}
                  </div>
                  <div>
                    <Label htmlFor="areaOfSpecialization">Area of Specialization</Label>
                    <Input
                      id="areaOfSpecialization"
                      value={formData.areaOfSpecialization}
                      onChange={(e) => setFormData((prev) => ({ ...prev, areaOfSpecialization: e.target.value }))}
                      placeholder="e.g., Computer Science"
                      className="mt-1"
                    />
                    {errors.areaOfSpecialization && <p className="text-red-500 text-sm mt-1">{errors.areaOfSpecialization}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="platoon">Platoon</Label>
                  <Select
                    value={String(formData.platoon)}
                    onValueChange={(v) => setFormData((prev) => ({ ...prev, platoon: Number(v) }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select platoon" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((p) => (
                        <SelectItem key={p} value={String(p)}>Platoon {p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.platoon && <p className="text-red-500 text-sm mt-1">{errors.platoon}</p>}
                </div>

                <div>
                  <Label htmlFor="campExperienceComment">Camp Experience Comment (Optional)</Label>
                  <Textarea
                    id="campExperienceComment"
                    value={formData.campExperienceComment}
                    onChange={(e) => setFormData((prev) => ({ ...prev, campExperienceComment: e.target.value }))}
                    placeholder="Share your camp experience..."
                    className="mt-1"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.campExperienceComment?.length || 0}/1000</p>
                  {errors.campExperienceComment && <p className="text-red-500 text-sm mt-1">{errors.campExperienceComment}</p>}
                </div>

                <div>
                  <Label>Higher Institutions</Label>
                  {errors.institutions && <p className="text-red-500 text-sm mt-1">{errors.institutions}</p>}
                  {errors.institutionDates && <p className="text-red-500 text-sm mt-1">{errors.institutionDates}</p>}
                  {errors.institutionFuture && <p className="text-red-500 text-sm mt-1">{errors.institutionFuture}</p>}
                  <div className="space-y-3 mt-2">
                    {formData.higherInstitutions.map((inst, index) => (
                      <Card key={index}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Institution {index + 1}</span>
                            {formData.higherInstitutions.length > 1 && (
                              <button onClick={() => removeInstitution(index)} className="text-red-500 hover:text-red-700">
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <Input
                            value={inst.name}
                            onChange={(e) => updateInstitution(index, "name", e.target.value)}
                            placeholder="Institution name"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Start Date</Label>
                              <Input
                                type="date"
                                value={inst.startDate}
                                onChange={(e) => updateInstitution(index, "startDate", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">End Date</Label>
                              <Input
                                type="date"
                                value={inst.endDate}
                                onChange={(e) => updateInstitution(index, "endDate", e.target.value)}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Button type="button" variant="outline" onClick={addInstitution} className="mt-2 w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Institution
                  </Button>
                </div>
              </div>

              <Button onClick={handleNext} className="w-full mt-6 bg-[#004d00] hover:bg-[#003300] h-12">
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Review Your Information</h2>
              <p className="text-gray-600 mb-6">Step 2: Preview all entered data</p>

              <div className="space-y-4">
                <ReviewItem label="Surname" value={formData.surname} />
                <ReviewItem label="Other Names" value={formData.otherNames} />
                {formData.changedName && <ReviewItem label="Former Name" value={formData.formerName} />}
                <ReviewItem label="State Code" value={formData.stateCode} />
                <ReviewItem label="Call-up Number" value={formData.callUpNumber} />
                <ReviewItem label="Phone Number" value={formData.phoneNumber} />
                <ReviewItem label="State of Origin" value={formData.stateOfOrigin} />
                <ReviewItem label="State of Deployment" value={formData.stateOfDeployment} />
                <ReviewItem label="Qualification" value={formData.qualification} />
                <ReviewItem label="Area of Specialization" value={formData.areaOfSpecialization} />
                <ReviewItem label="Platoon" value={`Platoon ${formData.platoon}`} />
                {formData.campExperienceComment && (
                  <ReviewItem label="Camp Experience" value={formData.campExperienceComment} />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700">Higher Institutions</p>
                  {formData.higherInstitutions.map((inst, i) => (
                    <p key={i} className="text-sm text-gray-600 ml-2">
                      {i + 1}. {inst.name} ({inst.startDate} - {inst.endDate})
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button onClick={handleNext} className="flex-1 h-12 bg-[#004d00] hover:bg-[#003300]">
                  Confirm
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center"
            >
              <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Final Confirmation</h2>
              <p className="text-gray-600 mb-6">
                Please note that this form can only be submitted once. Ensure all information is correct before proceeding.
              </p>

              {errors.submit && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                  {errors.submit}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-12">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 h-12 bg-[#004d00] hover:bg-[#003300]"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Submit Registration
                      <Check className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your registration has been submitted successfully. Your camp officials will review your profile.
              </p>
              <Button onClick={() => navigate("/")} className="bg-[#004d00] hover:bg-[#003300] h-12 px-8">
                Return Home
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}

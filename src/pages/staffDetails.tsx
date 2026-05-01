import { useNavigate, useParams } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { useDelete } from "../hooks/useDelete";
import { useUpdate } from "../hooks/useUpdate";
import type { IStaff } from "../interface/interface";
import { StaffAPI_URL } from "../help/enpoints";
import Button from "../components/button/button";
import Message from "../components/Ui/Mesage";
import { updateSuccessMessage, updateErrorMessage } from "../components/template/messageTemplates";
import style from "../styles/pages/staffDetails.module.css";
import { useState, useEffect, useRef } from "react";

type EditForm = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
  role: "admin" | "none";
  dateOfEmployment: string;
  image: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof EditForm, string>>;

const PLACEHOLDER_IMAGE_URL = "https://media.istockphoto.com/id/587805156/vector/profile-picture-vector-illustration.jpg?s=2048x2048&w=is&k=20&c=QjqBIsnahW5txrKJeIqLq53-b1PeYuSlG-zTAD1xsu4=";

function toDateInputValue(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function formatDateTime(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}.${month}.${year}. ${hours}:${minutes}`;
}

function formatDateOnly(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}.`;
}

function validate(form: EditForm, shouldChangePassword: boolean): FormErrors {
  const errs: FormErrors = {};
  if (!form.firstName.trim()) errs.firstName = "First name is required.";
  if (!form.lastName.trim()) errs.lastName = "Lastname is required.";
  if (!form.email.trim()) {
    errs.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errs.email = "Email is not valid.";
  }
  if (!form.phoneNumber.trim()) errs.phoneNumber = "Phone number is required.";
  if (!form.position.trim()) errs.position = "Position is required.";
  if (!form.dateOfEmployment) errs.dateOfEmployment = "Date of employment is required.";

  if (shouldChangePassword) {
    if (!form.password.trim()) {
      errs.password = "Password is required.";
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }

    if (!form.confirmPassword.trim()) {
      errs.confirmPassword = "Confirm password is required.";
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }
  }

  return errs;
}

function StaffDetails() {
  const { staffId } = useParams<{ staffId: string }>();
  const navigate = useNavigate();
  const endpoint = staffId ? `${StaffAPI_URL}/${staffId}` : "";
  const { data: staffMember, loading, error } = useFetch<IStaff>(endpoint);
  const { deleteData } = useDelete();
  const { updateData, loading: saving } = useUpdate<Partial<IStaff>>();
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditForm>({
    firstName: "", lastName: "", email: "", phoneNumber: "",
    position: "", role: "none", dateOfEmployment: "", image: "", password: "", confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [shouldChangePassword, setShouldChangePassword] = useState(false);
  const [messageProps, setMessageProps] = useState<{ isVisible: number; title: string; content: string; status: "success" | "error" | " " }>({
    isVisible: 0,
    title: "",
    content: "",
    status: " ",
  });

  useEffect(() => {
    if (staffMember) {
      setForm({
        firstName: staffMember.firstName ?? "",
        lastName: staffMember.lastName ?? "",
        email: staffMember.email ?? "",
        phoneNumber: staffMember.phoneNumber ?? "",
        position: staffMember.position ?? "",
        role: staffMember.role ?? "none",
        dateOfEmployment: toDateInputValue(staffMember.dateOfEmployment),
        image: staffMember.imageURL ?? staffMember.image ?? "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [staffMember]);

  const handleChange = (field: keyof EditForm, value: string) => {
    const updated = { ...form, [field]: value } as EditForm;
    setForm(updated);
    const errs = validate(updated, shouldChangePassword);
    setFormErrors(errs);
  };

  const handleEdit = () => {
    setFormErrors(validate(form, shouldChangePassword));
    setIsEditing(true);
    setSaveError(null);
  };

  const handleSave = async () => {
    const errs = validate(form, shouldChangePassword);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload: Record<string, unknown> = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phoneNumber: form.phoneNumber,
      position: form.position,
      role: form.role,
      dateOfEmployment: form.dateOfEmployment,
      imageURL: form.image,
    };

    if (shouldChangePassword) {
      payload.password = form.password;
    }

    try {
      await updateData(StaffAPI_URL, Number(staffId), payload);
      setIsEditing(false);
      setShouldChangePassword(false);
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      setSaveError(null);
      setMessageProps((prev) => ({ ...updateSuccessMessage("Staff member"), isVisible: prev.isVisible + 1 }));
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message;
      setSaveError(backendMessage ? String(backendMessage) : "Failed to save changes. Please try again.");
      setMessageProps((prev) => ({ ...updateErrorMessage("Staff member"), isVisible: prev.isVisible + 1 }));
    }
  };

  const handlePasswordToggle = () => {
    const next = !shouldChangePassword;
    setShouldChangePassword(next);
    const updated = { ...form, password: "", confirmPassword: "" };
    setForm(updated);
    setFormErrors(validate(updated, next));
  };

  const handleAddImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      handleChange("image", result);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async () => {
    if (!staffId) return;
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      await deleteData(StaffAPI_URL, Number(staffId));
      navigate("/dashboard");
    } catch {
      alert("Failed to delete staff member.");
    }
  };

  const hasErrors = Object.keys(formErrors).length > 0;

  if (!staffId) {
    return (
      <div className={style.page}>
        <h2>Staff member details</h2>
        <p>Invalid staff member id.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={style.page}>
        <h2>Staff member details</h2>
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={style.page}>
        <h2>Staff member details</h2>
        <p className={style.error}>Error loading staff member: {error.message}</p>
      </div>
    );
  }

  const renderField = (label: string, field: keyof EditForm, type = "text") => (
    <div className={style.row}>
      <span>{label}</span>
      <div className={style.fieldRight}>
        {isEditing ? (
          <>
            <input
              className={`${style.editInput} ${formErrors[field] ? style.inputError : ""}`}
              type={type}
              value={form[field]}
              onChange={e => handleChange(field, e.target.value)}
            />
            {formErrors[field] && <p className={style.fieldError}>{formErrors[field]}</p>}
          </>
        ) : (
          <strong>{type === "date" ? formatDateOnly(form[field]) : form[field] || "-"}</strong>
        )}
      </div>
    </div>
  );

  return (
    <div className={style.page}>
      <div className={style.header}>
        <h2>Staff member details</h2>
        <div className={style.actions}>
          {isEditing ? (
            <Button variant="success" size="small" onClick={handleSave} disabled={hasErrors || saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          ) : (
            <Button variant="edit" size="small" onClick={handleEdit}>Edit</Button>
          )}
          <Button variant="delete" size="small" onClick={handleDelete}>Delete</Button>
        </div>
      </div>

      {saveError && <p className={style.error}>{saveError}</p>}
  <Message isVisible={messageProps.isVisible} message={messageProps.status} messageDetails={messageProps} />

      <div className={style.card}>
        <div className={style.cardContent}>
          <div className={style.imageColumn}>
            <img
              className={style.cardImage}
              src={form.image || PLACEHOLDER_IMAGE_URL}
              alt={`${form.firstName} ${form.lastName}`}
            />

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className={style.hiddenFileInput}
              onChange={handleImageUpload}
            />

            {isEditing && (
              <>
                <Button variant="add" size="small" onClick={handleAddImageClick}>Add image</Button>
                <p className={style.orDivider}>OR</p>
                <div className={style.imageInputWrap}>
                  <input
                    className={style.editInput}
                    type="text"
                    placeholder="Paste image URL"
                    value={form.image}
                    onChange={e => handleChange("image", e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className={style.detailsColumn}>

            {renderField("First name", "firstName")}
            {renderField("Lastname", "lastName")}
            {renderField("E-mail", "email", "email")}
            {renderField("Phone number", "phoneNumber")}
            {renderField("Position", "position")}
            <div className={style.row}>
              <span>Role</span>
              <div className={style.fieldRight}>
                {isEditing ? (
                  <select
                    className={style.editInput}
                    value={form.role}
                    onChange={e => handleChange("role", e.target.value as "admin" | "none")}
                  >
                    <option value="admin">admin</option>
                    <option value="none">none</option>
                  </select>
                ) : (
                  <strong>{form.role || "-"}</strong>
                )}
              </div>
            </div>
            {renderField("Date of employment", "dateOfEmployment", "date")}

            {isEditing && (
              <>
                <div className={style.row}>
                  <span>Change password</span>
                  <div className={style.fieldRight}>
                    <label className={style.switchLabel}>
                      <input
                        type="checkbox"
                        checked={shouldChangePassword}
                        onChange={handlePasswordToggle}
                      />
                      <span>{shouldChangePassword ? "Enabled" : "Disabled"}</span>
                    </label>
                  </div>
                </div>

                {shouldChangePassword && (
                  <>
                    {renderField("New password", "password", "password")}
                    {renderField("Confirm password", "confirmPassword", "password")}
                  </>
                )}
              </>
            )}

            <div className={style.row}>
              <span>Created at</span>
              <div className={style.fieldRight}><strong>{formatDateTime(staffMember?.createdAt)}</strong></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default StaffDetails;

//components/template/messageTemplates.ts

// Succes message for creation
export const successMessage = (action: string) => ({
  status: "success" as "success",
  title: "Success",
  content: `${action} was created successfully.`,
});

// Error message for creation
export const errorMessage = (action: string) => ({
  status: "error" as "error",
  title: "Error",
  content: `${action} was not created successfully.`,
});

//confirmation message before deletion
export const confirmMessage = (action: string) => ({
  status: "warning" as "warning",
  title: "Are you sure?",
  content: `Do you really want to delete this ${action}? This process cannot be undone.`,
  options: ["Yes", "No"],
});

// Success message for deletion
export const deleteSuccessMessage = (action: string) => ({
  status: "success" as "success",
  title: "Success",
  content: `${action} was deleted successfully.`,
});

// Error message for deletion
export const deleteErrorMessage = (action: string) => ({
  status: "error" as "error",
  title: "Error",
  content: `Could not delete category ${action}`,
});

// Success message for update
export const updateSuccessMessage = (action: string) => ({
  status: "success" as "success",
  title: "Success",
  content: `${action} was updated successfully.`,
});

// Error message for update
export const updateErrorMessage = (action: string) => ({
  status: "error" as "error",
  title: "Error",
  content: `Could not update ${action}`,
});

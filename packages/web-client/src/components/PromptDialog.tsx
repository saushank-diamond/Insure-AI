import { LeadStatus, PromptType } from "@/api/schemas";
import { Prompt } from "@/api/schemas/prompt";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ErrorMessage, Field, Form, Formik } from "formik";
import React from "react";
import * as Yup from "yup";
import { CreatePromptRequest, UpdatePromptRequest } from "../app/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Prompt name is required"),
  known_to_agent: Yup.string().when("prompt_type", {
    is: PromptType.conversation,
    then: () => Yup.string().required("Personality type is required"),
    otherwise: () => Yup.string().notRequired(),
  }),
  text: Yup.string().required("Prompt text is required"),
  report_prompt_text: Yup.string().required("Report text is required"),
  description: Yup.string().required("Description is required"),
});

interface PromptDialogProps {
  isOpen: boolean;
  mode: "view" | "edit" | "create" | null;
  prompt: Prompt | null;
  onClose: () => void;
  onEditSubmit: (
    id: string,
    updatedPrompt: Partial<UpdatePromptRequest>
  ) => void;
  onCreateSubmit: (newPrompt: Partial<CreatePromptRequest>) => void;
}

const PromptDialog: React.FC<PromptDialogProps> = ({
  isOpen,
  mode,
  prompt,
  onClose,
  onEditSubmit,
  onCreateSubmit,
}) => {
  const handleSubmit = (values: any) => {
    if (mode === "edit" && prompt) {
      const updatedFields: Partial<UpdatePromptRequest> = {};

      if (values.name !== "" && values.name !== prompt.name) {
        updatedFields.name = values.name;
      }
      if (values.text !== "" && values.text !== prompt.text) {
        updatedFields.text = values.text;
      }
      if (
        values.known_to_agent !== "" &&
        values.known_to_agent !== prompt.known_to_agent
      ) {
        updatedFields.known_to_agent = values.known_to_agent;
      }
      if (
        values.meeting_status !== "" &&
        values.meeting_status !== prompt.meeting_status
      ) {
        updatedFields.meeting_status = values.meeting_status;
      }
      if (
        values.report_prompt_text !== "" &&
        values.report_prompt_text !== prompt.report_prompt_text
      ) {
        updatedFields.report_prompt_text = values.report_prompt_text;
      }
      if (
        values.description !== "" &&
        values.description !== prompt.description
      ) {
        updatedFields.description = values.description;
      }

      onEditSubmit(prompt.id as string, updatedFields);
    } else if (mode === "create") {
      onCreateSubmit(values);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit"
              ? "Edit Prompt"
              : mode === "create"
                ? "Create Prompt"
                : "View Prompt"}
          </DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{
            name: prompt?.name || "",
            text: prompt?.text || "",
            known_to_agent: prompt?.known_to_agent || "Friends",
            meeting_status: prompt?.meeting_status || LeadStatus.Yet_to_Contact,
            report_prompt_text: prompt?.report_prompt_text || "",
            description: prompt?.description || "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {() => (
            <Form className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right text-white">
                  Prompt Name
                </Label>
                <Field
                  as={Input}
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter prompt name"
                  className="col-span-3 text-white"
                  disabled={mode === "view"}
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right text-white">
                  Prompt Description
                </Label>
                <Field
                  as={Input}
                  type="text"
                  id="description"
                  name="description"
                  placeholder="Enter prompt description"
                  className="col-span-3 text-white"
                  disabled={mode === "view"}
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="text-red-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="known_to_agent"
                  className="text-right text-white"
                >
                  Personality Type
                </Label>
                <Field
                  as="select"
                  id="known_to_agent"
                  name="known_to_agent"
                  className="col-span-3 dark:bg-buttonGray p-2 rounded-md"
                  disabled={mode === "view"}
                >
                  <option value="" disabled className="text-cuteBlue">
                    Select Personality Type
                  </option>
                  <option value="Assertive">Assertive</option>
                  <option value="Patient">Patient</option>
                  <option value="Aggresive">Aggresive</option>
                  <option value="Busy Bee">Busy Bee</option>
                  <option value="Impatient">Impatient</option>
                </Field>
                <ErrorMessage
                  name="known_to_agent"
                  component="div"
                  className="text-red-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="meeting_status"
                  className="text-right text-white"
                >
                  Call Type
                </Label>
                <Field
                  as="select"
                  id="meeting_status"
                  name="meeting_status"
                  className="col-span-3 dark:bg-buttonGray p-2 rounded-md"
                  disabled={mode === "view"}
                >
                  <option value="" disabled className="text-cuteBlue">
                    Select Call Type
                  </option>
                  {Object.values(LeadStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="meeting_status"
                  component="div"
                  className="text-red-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="text" className="text-right text-white">
                  Prompt Text
                </Label>
                <Field
                  as={Textarea}
                  id="text"
                  name="text"
                  placeholder="Enter prompt text"
                  className="col-span-3 text-white"
                  disabled={mode === "view"}
                />
                <ErrorMessage
                  name="text"
                  component="div"
                  className="text-red-500"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="report_prompt_text"
                  className="text-right text-white"
                >
                  Report Prompt
                </Label>
                <Field
                  as={Textarea}
                  id="report_prompt_text"
                  name="report_prompt_text"
                  placeholder="Enter report prompt text"
                  className="col-span-3 text-white"
                  disabled={mode === "view"}
                />
                <ErrorMessage
                  name="report_prompt_text"
                  component="div"
                  className="text-red-500"
                />
              </div>
              <DialogFooter>
                {mode === "edit" || mode === "create" ? (
                  <>
                    <Button type="submit">
                      {mode === "edit" ? "Save Changes" : "Create Prompt"}
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                  </>
                ) : (
                  <Button onClick={onClose}>Close</Button>
                )}
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default PromptDialog;

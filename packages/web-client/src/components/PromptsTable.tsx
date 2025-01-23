"use client";
import {
  usePromptsCreatePrompt,
  usePromptsDeletePrompt,
  usePromptsGetPrompts,
  usePromptsUpdatePrompt,
} from "@/api/prompts/prompts";
import { Prompt } from "@/api/schemas/prompt";
import { PromptType } from "@/api/schemas/promptType";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useMemo, useState } from "react";
import { CreatePromptRequest, UpdatePromptRequest } from "../app/api";
import PromptDialog from "./PromptDialog";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { EditIcon, TrashIcon } from "./ui/icons";
import { useToast } from "./ui/use-toast";

interface TableColumn {
  key: string;
  label: string;
  show?: boolean;
}

const truncateText = (text: string, maxLength: number) => {
  if (text && text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
};

const PromptsTable = () => {
  const { toast } = useToast();
  let branchID = "";
  if (typeof window !== "undefined") {
    branchID = localStorage.getItem("branchID") ?? "";
  }

  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    mode: "view" | "edit" | "create" | null;
    prompt: Prompt | null;
  }>({ isOpen: false, mode: null, prompt: null });

  const { mutateAsync: deletePrompt } = usePromptsDeletePrompt();
  const { mutateAsync: updatePrompt } = usePromptsUpdatePrompt();
  const { mutateAsync: createPrompt } = usePromptsCreatePrompt();
  const {
    data: promptsData,
    isLoading,
    refetch: refetchPrompts,
    isError,
  } = usePromptsGetPrompts<Prompt[]>({
    branch_id: branchID,
  });

  useEffect(() => {
    if (promptsData) {
      setAllPrompts(
        promptsData.filter((prompt) => prompt.prompt_type === "conversation")
      );
    }
  }, [promptsData]);

  const columns: TableColumn[] = useMemo(
    () => [
      { key: "name", label: "Prompt Name", show: true },
      { key: "text", label: "Text", show: true },
      { key: "addedBy", label: "Added By", show: true },
      { key: "actions", label: "", show: true },
    ],
    []
  );

  const handlePromptClick = (prompt: Prompt) => {
    setDialogState({ isOpen: true, mode: "view", prompt });
  };

  const handleEditClick = (prompt: Prompt) => {
    setDialogState({ isOpen: true, mode: "edit", prompt });
  };

  const handleDialogClose = () => {
    setDialogState({ isOpen: false, mode: null, prompt: null });
  };

  const handleCreateClick = () => {
    setDialogState({ isOpen: true, mode: "create", prompt: null });
  };

  const handleDeleteClick = async (promptId: string) => {
    try {
      await deletePrompt({ promptId });
      setAllPrompts(allPrompts.filter((prompt) => prompt.id !== promptId));
      toast({
        title: "Success",
        description: "Prompt deleted successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete prompt",
      });
    }
  };

  const updateDefaultPrompts = (
    updatedPromptId: string,
    promptType: PromptType
  ) => {
    setAllPrompts((prevPrompts) =>
      prevPrompts.map((prompt) => {
        if (prompt.prompt_type === promptType) {
          return { ...prompt, is_default: prompt.id === updatedPromptId };
        }
        return prompt;
      })
    );
  };

  const handleEditSubmit = async (
    id: string,
    updatedPrompt: Partial<UpdatePromptRequest>
  ) => {
    try {
      await updatePrompt({
        promptId: id,
        data: updatedPrompt as UpdatePromptRequest,
      });

      const newData = await refetchPrompts();
      if (newData.data) {
        if (updatedPrompt.is_default !== undefined) {
          updateDefaultPrompts(id, updatedPrompt.prompt_type as PromptType);
        }
        setAllPrompts(newData.data);
      }

      toast({
        title: "Success",
        description: "Prompt updated successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update prompt",
      });
    }

    handleDialogClose();
  };

  const handleCreateSubmit = async (
    newPrompt: Partial<CreatePromptRequest>
  ) => {
    try {
      const response = await createPrompt({
        data: {
          branch_id: branchID,
          ...newPrompt,
        } as CreatePromptRequest,
      });

      const newData = await refetchPrompts();
      if (newData.data) {
        if (newPrompt.is_default) {
          updateDefaultPrompts(
            response.id,
            newPrompt.prompt_type as PromptType
          );
        }
        setAllPrompts(newData.data);
      }

      toast({
        title: "Success",
        description: "Prompt created successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create prompt",
      });
    }
    handleDialogClose();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col  items-center justify-center text-white text-xl">
        Loading...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center text-white text-xl">
        Error loading prompts. Try again later.
      </div>
    );
  }

  return (
    <div className="mt-5 ml-5 flex">
      <Card className="dark:bg-otherBlue w-full mr-96 p-0">
        <CardHeader>
          <CardTitle className="flex flex-row justify-between items-center text-lg p-0">
            Prompts
            <Button onClick={handleCreateClick}>Create Prompt</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Card className="dark:bg-otherBlue rounded-none">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="border-b border-gray-200">
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead
                        key={column.key}
                        className={
                          column.show === false ? "hidden md:table-cell" : ""
                        }
                      >
                        {column.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPrompts.map((prompt) => (
                    <TableRow key={prompt.id} className="cursor-pointer">
                      {columns.map((column) => (
                        <TableCell
                          key={`${prompt.id}-${column.key}`}
                          className={
                            column.show === false ? "hidden md:table-cell" : ""
                          }
                          onClick={
                            column.key === "text"
                              ? undefined
                              : () => handlePromptClick(prompt)
                          }
                        >
                          {column.key === "name"
                            ? prompt.name
                            : column.key === "text"
                              ? truncateText(prompt?.text, 50)
                              : column.key === "addedBy"
                                ? prompt?.created_by_name
                                : null}
                        </TableCell>
                      ))}
                      <TableCell className="hidden md:table-cell">
                        <>
                          <Button
                            className="rounded-full p-2 bg-gray-200 dark:bg-bgBlue border border-circle"
                            onClick={() => handleEditClick(prompt)}
                          >
                            <EditIcon />
                          </Button>
                          <Button
                            className="rounded-full p-2 bg-gray-200 dark:bg-bgBlue border border-circle"
                            onClick={() => handleDeleteClick(prompt.id)}
                          >
                            <TrashIcon />
                          </Button>
                        </>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </CardContent>
        <PromptDialog
          isOpen={dialogState.isOpen}
          mode={dialogState.mode}
          prompt={dialogState.prompt}
          onClose={handleDialogClose}
          onEditSubmit={handleEditSubmit}
          onCreateSubmit={handleCreateSubmit}
        />
      </Card>
    </div>
  );
};

export default PromptsTable;

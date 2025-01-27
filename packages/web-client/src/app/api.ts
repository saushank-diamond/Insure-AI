/**
 * Generated by orval v6.26.0 🍺
 * Do not edit manually.
 * refreshmint backend
 * OpenAPI spec version: 0.1.0
 */
import {
  CreatePromptRequestKnownToAgent,
  CreatePromptRequestMeetingStatus,
  PromptType,
  UpdatePromptRequestKnownToAgent,
  UpdatePromptRequestMeetingStatus,
} from "@/api/schemas";
import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
export type PromptsGetPromptsParams = {
  branch_id: string;
};

export type LeadsGetLeadsParams = {
  branch_id: string;
};

export type ValidationErrorLocItem = string | number;

export interface ValidationError {
  loc: ValidationErrorLocItem[];
  msg: string;
  type: string;
}

export interface UserRegisterRequest {
  email: string;
  full_name: string;
  organization_name: string;
  /** @minLength 8 */
  password: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UpdatePromptRequest {
  known_to_agent?: UpdatePromptRequestKnownToAgent;
  meeting_status?: UpdatePromptRequestMeetingStatus;
  name: string;
  text: string;
  prompt_type: PromptType;
  is_default?: boolean;
  report_prompt_text: string;
  description: string;
}

export type UpdateLeadRequestProfile = Profile | null;

export type UpdateLeadRequestLead = Lead | null;

export interface UpdateLeadRequest {
  lead?: UpdateLeadRequestLead;
  profile?: UpdateLeadRequestProfile;
}

export interface Token {
  access_token: string;
  token_type?: string;
}

export type ProfileZipcode = string | null;

export type ProfileTrustLevel = string | null;

export type ProfileState = string | null;

export type ProfileSavings = number | null;

export type ProfilePhysicalAddress = string | null;

export type ProfileOtherLoan = boolean | null;

export type ProfileOccupation = string | null;

export type ProfileMaritalStatus = string | null;

export type ProfileLikes = string | null;

export type ProfileIncomeRange = string | null;

export type ProfileHomeLoan = boolean | null;

export type ProfileHealthStatus = string | null;

export type ProfileGender = string | null;

export type ProfileFullName = string | null;

export type ProfileFinancialLiteracy = string | null;

export type ProfileExistingInsuranceCoverage = string | null;

export type ProfileEmail = string | null;

export type ProfileEarningMembers = number | null;

export type ProfileDislikes = string | null;

export type ProfileDesiredInsuranceCoverage = string | null;

export type ProfileDesignation = string | null;

export type ProfileDependents = number | null;

export type ProfileDeletedAt = string | null;

export type ProfileDecisionMakingStyle = string | null;

export type ProfileCountry = string | null;

export type ProfileContactNumber = string | null;

export type ProfileConcernsAndPriorities = string | null;

export type ProfileCityTier = string | null;

export type ProfileCity = string | null;

export type ProfileCarLoan = boolean | null;

export type ProfileBudgetConscious = string | null;

export type ProfileAge = string | null;

export interface Profile {
  age?: ProfileAge;
  branch_id: string;
  budget_conscious?: ProfileBudgetConscious;
  car_loan?: ProfileCarLoan;
  city?: ProfileCity;
  city_tier?: ProfileCityTier;
  concerns_and_priorities?: ProfileConcernsAndPriorities;
  contact_number?: ProfileContactNumber;
  country?: ProfileCountry;
  created_at?: string;
  decision_making_style?: ProfileDecisionMakingStyle;
  deleted_at?: ProfileDeletedAt;
  dependents?: ProfileDependents;
  designation?: ProfileDesignation;
  desired_insurance_coverage?: ProfileDesiredInsuranceCoverage;
  dislikes?: ProfileDislikes;
  earning_members?: ProfileEarningMembers;
  email?: ProfileEmail;
  existing_insurance_coverage?: ProfileExistingInsuranceCoverage;
  financial_literacy?: ProfileFinancialLiteracy;
  full_name?: ProfileFullName;
  gender?: ProfileGender;
  health_status?: ProfileHealthStatus;
  home_loan?: ProfileHomeLoan;
  id: string;
  income_range?: ProfileIncomeRange;
  lead_id: string;
  likes?: ProfileLikes;
  marital_status?: ProfileMaritalStatus;
  object?: string;
  occupation?: ProfileOccupation;
  organization_id: string;
  other_loan?: ProfileOtherLoan;
  physical_address?: ProfilePhysicalAddress;
  savings?: ProfileSavings;
  state?: ProfileState;
  trust_level?: ProfileTrustLevel;
  updated_at?: string;
  zipcode?: ProfileZipcode;
}

export type LeadType = (typeof LeadType)[keyof typeof LeadType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const LeadType = {
  suspect: "suspect",
  prospect: "prospect",
} as const;

export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const LeadStatus = {
  Yet_to_Contact: "Yet to Contact",
  "Contacted_&_Dropped": "Contacted & Dropped",
  "1st_Meeting_Scheduled": "1st Meeting Scheduled",
  "1st_Meeting_Completed": "1st Meeting Completed",
  "2nd_Meeting_Scheduled": "2nd Meeting Scheduled",
  Call_Closed: "Call Closed",
} as const;

export type LeadMeetingDate = string | null;

export type LeadKnownToAgent = string | null;

export type LeadDeletedAt = string | null;

export type LeadAssociatedAgent = string | null;

export interface Lead {
  associated_agent?: LeadAssociatedAgent;
  branch_id: string;
  created_at?: string;
  deleted_at?: LeadDeletedAt;
  id: string;
  known_to_agent?: LeadKnownToAgent;
  meeting_date?: LeadMeetingDate;
  object?: string;
  organization_id: string;
  status?: LeadStatus;
  type?: LeadType;
  updated_at?: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

export interface CreatePromptRequest {
  branch_id: string;
  known_to_agent?: CreatePromptRequestKnownToAgent;
  meeting_status?: CreatePromptRequestMeetingStatus;
  name: string;
  text: string;
  is_default?: boolean;
  prompt_type: PromptType;
  report_prompt_text: string;
  description: string;
}

export type CreateLeadRequestProfile = { [key: string]: any };

export interface CreateLeadRequest {
  branch_id: string;
  profile?: CreateLeadRequestProfile;
  type: LeadType;
}

export interface CreateBranchRequest {
  name: string;
}

/**
 * Register a new user account.

Args:
- req: UserRegisterRequest object containing the user's registration details.
- user_service: Instance of UserService for user-related operations.
- organization_service: Instance of OrganizationService for organization-related operations.

Returns:
- Token: Access token for the registered user.
 * @summary Register
 */
export const authenticationRegister = <TData = AxiosResponse<Token>>(
  userRegisterRequest: UserRegisterRequest,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axios.post(`/v1/register`, userRegisterRequest, options);
};

/**
 * Authenticates a user and generates an access token.

Args:
    req (UserLoginRequest): The user login request object containing email and password.
    user_service (UserService): The user service instance.
    organization_service (OrganizationService): The organization service instance.

Returns:
    Token: The access token object containing the generated access token and token type.
 * @summary Login
 */
export const authenticationLogin = <TData = AxiosResponse<Token>>(
  userLoginRequest: UserLoginRequest,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axios.post(`/v1/login`, userLoginRequest, options);
};

/**
 * @summary Get Me
 */
export const authenticationGetMe = <TData = AxiosResponse<unknown>>(
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axios.post(`/v1/me`, undefined, options);
};

/**
 * Create a new branch for an organization.

Args:
    req (CreateBranchRequest): The request object containing branch details.
    user_ctx (UserContext): The user context object.
    organization_service (OrganizationService): The organization service.

Returns:
    Branch: The response object containing the created branch details.
 * @summary Create Branch
 */
export const branchesCreateBranch = <TData = AxiosResponse<unknown>>(
  createBranchRequest: CreateBranchRequest,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axios.post(`/v1/branches`, createBranchRequest, options);
};

/**
 * Create a new lead and associated profile.

Args:
    req (CreateLeadRequest): The request object containing lead details.
    user_ctx (UserContextDep): The user context object.
    lead_service (LeadServiceDep): The lead service dependency.

Returns:
    LeadResponse: The response object containing the created lead and profile.
 * @summary Create Lead
 */
export const leadsCreateLead = <TData = AxiosResponse<unknown>>(
  createLeadRequest: CreateLeadRequest,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axios.post(`/v1/leads`, createLeadRequest, options);
};

/**
 * Retrieve leads for a specific branch.

Args:
    branch_id (str): The ID of the branch.
    user_ctx (UserContextDep): The user context dependency.
    lead_service (LeadServiceDep): The lead service dependency.
    organization_service (OrganizationServiceDep): The organization service dependency.

Returns:
    List[LeadResponse]: A list of LeadResponse objects representing the leads for the branch.
 * @summary Get Leads
 */
export const leadsGetLeads = <TData = AxiosResponse<unknown>>(
  params: LeadsGetLeadsParams,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axios.get(`/v1/leads`, {
    ...options,
    params: { ...params, ...options?.params },
  });
};

/**
 * Update a lead and its associated profile.

Args:
    lead_id (str): The ID of the lead to update.
    req (UpdateLeadRequest): The request object containing the updated lead and profile data.
    user_ctx (UserContextDep): The user context dependency.
    lead_service (LeadServiceDep): The lead service dependency.

Returns:
    dict: A dictionary containing the updated lead and profile.

Raises:
    CustomException: If the lead is not found.
 * @summary Update Lead
 */
export const leadsUpdateLead = <TData = AxiosResponse<unknown>>(
  leadId: string,
  updateLeadRequest: UpdateLeadRequest,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axios.post(`/v1/leads/${leadId}`, updateLeadRequest, options);
};

/**
 * Retrieve a lead by its ID.

Args:
    lead_id (str): The ID of the lead to retrieve.
    user_ctx (UserContextDep): The user context dependency.
    lead_service (LeadServiceDep): The lead service dependency.

Returns:
    LeadResponse: The response object containing the lead.

Raises:
    CustomException: If the lead is not found.
 * @summary Get Lead
 */
export const leadsGetLead = <TData = AxiosResponse<unknown>>(
  leadId: string,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axios.get(`/v1/leads/${leadId}`, options);
};

/**
 * Delete a lead by its ID.

Args:
    lead_id (str): The ID of the lead to delete.
    user_ctx (UserContextDep): The user context dependency.
    lead_service (LeadServiceDep): The lead service dependency.

Returns:
    DeleteResponse: The response indicating whether the lead was successfully deleted.
 * @summary Delete Lead
 */
export const leadsDeleteLead = <TData = AxiosResponse<unknown>>(
  leadId: string,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axios.delete(`/v1/leads/${leadId}`, options);
};

/**
 * Create a new prompt.

Args:
    req (CreatePromptRequest): The request object containing the prompt details.
    user_ctx (UserContextDep): The user context object.
    prompt_service (PromptServiceDep): The prompt service dependency.

Returns:
    The created prompt.
 * @summary Create Prompt
 */
export const promptsCreatePrompt = <TData = AxiosResponse<unknown>>(
  createPromptRequest: CreatePromptRequest,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axios.post(`/v1/prompts`, createPromptRequest, options);
};

/**
 * Retrieves prompts for a given branch.

Args:
    branch_id (str): The ID of the branch.
    user_ctx (UserContextDep): The user context.
    prompt_service (PromptServiceDep): The prompt service.

Returns:
    List[Prompt]: A list of prompts for the given branch.
 * @summary Get Prompts
 */
export const promptsGetPrompts = <TData = AxiosResponse<unknown>>(
  params: PromptsGetPromptsParams,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axios.get(`/v1/prompts`, {
    ...options,
    params: { ...params, ...options?.params },
  });
};

/**
 * Update a prompt with the given prompt_id.

Args:
    prompt_id (str): The ID of the prompt to update.
    req (UpdatePromptRequest): The request object containing the updated prompt data.
    user_ctx (UserContextDep): The user context dependency.
    prompt_service (PromptServiceDep): The prompt service dependency.

Returns:
    Prompt: The updated prompt object.

Raises:
    HTTPException: If the prompt with the given prompt_id is not found.
 * @summary Update Prompt
 */
export const promptsUpdatePrompt = <TData = AxiosResponse<unknown>>(
  promptId: string,
  updatePromptRequest: UpdatePromptRequest,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axios.post(`/v1/prompts/${promptId}`, updatePromptRequest, options);
};

/**
 * Retrieve a prompt by its ID.

Args:
    prompt_id (str): The ID of the prompt to retrieve.
    user_ctx (UserContextDep): The user context dependency.
    prompt_service (PromptServiceDep): The prompt service dependency.

Returns:
    The prompt object if found, otherwise raises a custom exception with status code 404.
 * @summary Get Lead
 */
export const promptsGetLead = <TData = AxiosResponse<unknown>>(
  promptId: string,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axios.get(`/v1/prompts/${promptId}`, options);
};

/**
 * Delete a prompt by its ID.

Args:
    prompt_id (str): The ID of the prompt to delete.
    user_ctx (UserContextDep): The user context dependency.
    prompt_service (PromptServiceDep): The prompt service dependency.

Returns:
    DeleteResponse: The response indicating whether the prompt was successfully deleted.
 * @summary Delete Prompt
 */
export const promptsDeletePrompt = <TData = AxiosResponse<unknown>>(
  promptId: string,
  options?: AxiosRequestConfig
): Promise<TData> => {
  return axios.delete(`/v1/prompts/${promptId}`, options);
};

export type AuthenticationRegisterResult = AxiosResponse<Token>;
export type AuthenticationLoginResult = AxiosResponse<Token>;
export type AuthenticationGetMeResult = AxiosResponse<unknown>;
export type BranchesCreateBranchResult = AxiosResponse<unknown>;
export type LeadsCreateLeadResult = AxiosResponse<unknown>;
export type LeadsGetLeadsResult = AxiosResponse<unknown>;
export type LeadsUpdateLeadResult = AxiosResponse<unknown>;
export type LeadsGetLeadResult = AxiosResponse<unknown>;
export type LeadsDeleteLeadResult = AxiosResponse<unknown>;
export type PromptsCreatePromptResult = AxiosResponse<unknown>;
export type PromptsGetPromptsResult = AxiosResponse<unknown>;
export type PromptsUpdatePromptResult = AxiosResponse<unknown>;
export type PromptsGetLeadResult = AxiosResponse<unknown>;
export type PromptsDeletePromptResult = AxiosResponse<unknown>;

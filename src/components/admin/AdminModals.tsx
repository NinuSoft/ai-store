import React from 'react';
import type { Plan, Order, Subscription, GmailAccount, UserProfile, AdminTab } from './types';
import { CrudFormModal } from './modals/CrudFormModal';
import { ConfirmModal } from './modals/ConfirmModal';
import { AssignGmailToOrderModal } from './modals/AssignGmailToOrderModal';
import { ReassignGmailToSubModal } from './modals/ReassignGmailToSubModal';
import { GmailAccountDetailsModal } from './modals/GmailAccountDetailsModal';

interface AdminModalsProps {
  activeTab: AdminTab;
  isAdding: boolean;
  editingItem: any;
  formFields: any;
  setFormFields: (fields: any) => void;
  setIsAdding: (val: boolean) => void;
  setEditingItem: (item: any) => void;
  productsList: any[];
  plans: Record<string, Plan>;
  subscriptions: Subscription[];
  gmailAccountsList: GmailAccount[];
  users: UserProfile[];
  confirmConfig: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  };
  setConfirmConfig: (config: any) => void;
  assigningOrder: Order | null;
  setAssigningOrder: (order: Order | null) => void;
  assigningSub: Subscription | null;
  setAssigningSub: (sub: Subscription | null) => void;
  selectedGmailAccountDetails: GmailAccount | null;
  setSelectedGmailAccountDetails: (gmail: GmailAccount | null) => void;
  showSnackbar: (msg: string, type?: 'success' | 'error') => void;
  handleSaveProduct: () => Promise<void>;
  handleSavePlan: () => Promise<void>;
  handleSaveFaq: () => Promise<void>;
  handleSaveTestimonial: () => Promise<void>;
  handleSaveGmailAccount: () => Promise<void>;
  handleApproveOrderWithAccount: (order: Order, gmailAccountId: string | null) => Promise<void>;
  handleAssignGmailAccountToSubscription: (subId: string, gmailAccountId: string | null) => Promise<void>;
}

export const AdminModals: React.FC<AdminModalsProps> = ({
  activeTab,
  isAdding,
  editingItem,
  formFields,
  setFormFields,
  setIsAdding,
  setEditingItem,
  productsList,
  plans,
  subscriptions,
  gmailAccountsList,
  users,
  confirmConfig,
  setConfirmConfig,
  assigningOrder,
  setAssigningOrder,
  assigningSub,
  setAssigningSub,
  selectedGmailAccountDetails,
  setSelectedGmailAccountDetails,
  showSnackbar,
  handleSaveProduct,
  handleSavePlan,
  handleSaveFaq,
  handleSaveTestimonial,
  handleSaveGmailAccount,
  handleApproveOrderWithAccount,
  handleAssignGmailAccountToSubscription
}) => {
  return (
    <>
      <CrudFormModal
        activeTab={activeTab}
        isAdding={isAdding}
        editingItem={editingItem}
        formFields={formFields}
        setFormFields={setFormFields}
        setIsAdding={setIsAdding}
        setEditingItem={setEditingItem}
        productsList={productsList}
        plans={plans}
        handleSaveProduct={handleSaveProduct}
        handleSavePlan={handleSavePlan}
        handleSaveFaq={handleSaveFaq}
        handleSaveTestimonial={handleSaveTestimonial}
        handleSaveGmailAccount={handleSaveGmailAccount}
      />
      <ConfirmModal
        confirmConfig={confirmConfig}
        setConfirmConfig={setConfirmConfig}
      />
      <AssignGmailToOrderModal
        assigningOrder={assigningOrder}
        setAssigningOrder={setAssigningOrder}
        plans={plans}
        gmailAccountsList={gmailAccountsList}
        subscriptions={subscriptions}
        handleApproveOrderWithAccount={handleApproveOrderWithAccount}
      />
      <ReassignGmailToSubModal
        assigningSub={assigningSub}
        setAssigningSub={setAssigningSub}
        plans={plans}
        gmailAccountsList={gmailAccountsList}
        subscriptions={subscriptions}
        handleAssignGmailAccountToSubscription={handleAssignGmailAccountToSubscription}
      />
      <GmailAccountDetailsModal
        selectedGmailAccountDetails={selectedGmailAccountDetails}
        setSelectedGmailAccountDetails={setSelectedGmailAccountDetails}
        plans={plans}
        subscriptions={subscriptions}
        users={users}
        showSnackbar={showSnackbar}
      />
    </>
  );
};

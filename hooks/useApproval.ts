import useSWR from 'swr';
import { useState, useCallback } from 'react';
import { approvalsApi } from '@/lib/api/approvals.api';
import type { ApprovalActionResult } from '@/lib/api/approvals.api';

/**
 * useApproval — payout details + approve/decline actions.
 *
 * Used on the approval page: /approve/:token
 * NO JWT required — the URL token is the credential.
 *
 * Flow:
 *   1. On mount, GET /approve/:token → fetch payout details
 *   2. Show amount, fund, destination, initiator, expiry
 *   3. Ask signatory to confirm last 4 digits of phone
 *   4. On confirm: POST /approve/:token (approve) or POST /approve/:token/decline
 *   5. Show result: quorum reached / need more / declined
 */
export function useApproval(token: string | null) {
  const [phoneLast4,  setPhoneLast4]  = useState('');
  const [acting,      setActing]      = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [result,      setResult]      = useState<ApprovalActionResult | null>(null);

  // Fetch payout details from the token
  const { data: details, error: detailsError, isLoading: detailsLoading } = useSWR(
    token ? ['approval', token] : null,
    () => approvalsApi.getDetails(token!),
    {
      revalidateOnFocus:  false,  // don't re-fetch — token is single-use
      shouldRetryOnError: false,  // don't retry — 404 = token not found
    },
  );

  /**
   * approve — POST /approve/:token
   * Requires phone_last4 confirmation for identity verification.
   */
  const approve = useCallback(async () => {
    if (!token || phoneLast4.length !== 4) {
      setActionError('Enter the last 4 digits of your registered phone number');
      return;
    }

    setActing(true);
    setActionError(null);

    try {
      const res = await approvalsApi.approve(token, phoneLast4);
      setResult(res);
      return res;
    } catch (err: any) {
      setActionError(err.message ?? 'Approval failed. Please try again.');
    } finally {
      setActing(false);
    }
  }, [token, phoneLast4]);

  /**
   * decline — POST /approve/:token/decline
   * Also requires phone_last4 confirmation.
   * Any single decline immediately cancels the payout.
   */
  const decline = useCallback(async () => {
    if (!token || phoneLast4.length !== 4) {
      setActionError('Enter the last 4 digits of your registered phone number');
      return;
    }

    setActing(true);
    setActionError(null);

    try {
      const res = await approvalsApi.decline(token, phoneLast4);
      setResult(res);
      return res;
    } catch (err: any) {
      setActionError(err.message ?? 'Could not record decline. Please try again.');
    } finally {
      setActing(false);
    }
  }, [token, phoneLast4]);

  const isExpired    = details?.alreadyActed ?? false;
  const hasActed     = details?.alreadyActed ?? false;
  const isTokenError = !!(detailsError && (
    detailsError.status === 404 ||
    detailsError.status === 410 ||
    detailsError.code === 'NOT_FOUND' ||
    detailsError.code === 'TOKEN_USED'
  ));

  return {
    // Payout details
    details,
    detailsLoading,
    detailsError,
    isTokenError,
    hasActed,

    // Phone input
    phoneLast4,
    setPhoneLast4,

    // Action state
    acting,
    actionError,
    result,

    // Actions
    approve,
    decline,

    // Derived state
    isComplete: result !== null,
    wasApproved: result?.status === 'APPROVED' || result?.status === 'TRANSFER_INITIATED',
    wasDeclined: result?.status === 'DECLINED',
  };
}
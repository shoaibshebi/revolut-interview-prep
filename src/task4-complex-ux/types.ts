/**
 * TASK 4: Complex UX (Loading + Error + Empty)
 * Domain: searching a user's cards by name/merchant label.
 */
export interface Card {
  id: string;
  label: string;
  last4: string;
  frozen: boolean;
}

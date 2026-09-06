import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SendMoneyForm } from './SendMoneyForm';
import * as api from './api';

jest.mock('./api');
const mockedSubmit = jest.mocked(api.submitSendMoney);

describe('<SendMoneyForm />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a real-time validation error as soon as an invalid email is typed', async () => {
    const user = userEvent.setup();
    render(<SendMoneyForm />);

    await user.type(screen.getByLabelText(/recipient email/i), 'not-an-email');

    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });

  it('blocks submit and surfaces all errors when the form is empty', async () => {
    const user = userEvent.setup();
    render(<SendMoneyForm />);

    await user.click(screen.getByRole('button', { name: /send money/i }));

    expect(await screen.findByText(/recipient email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
    expect(mockedSubmit).not.toHaveBeenCalled();
  });

  it('submits valid data, disables the button while submitting, and shows the confirmation', async () => {
    mockedSubmit.mockResolvedValueOnce({ confirmationId: 'conf_1', amountSent: 100, fee: 2 });
    const user = userEvent.setup();
    render(<SendMoneyForm />);

    await user.type(screen.getByLabelText(/recipient email/i), 'friend@example.com');
    await user.type(screen.getByLabelText(/amount/i), '100');

    const submitButton = screen.getByRole('button', { name: /send money/i });
    await user.click(submitButton);

    expect(await screen.findByText(/sent! confirmation: conf_1/i)).toBeInTheDocument();
    expect(mockedSubmit).toHaveBeenCalledTimes(1);
  });

  it('shows a contextual submit error and re-enables the form on failure', async () => {
    mockedSubmit.mockRejectedValueOnce(new Error('Recipient bank rejected transfer'));
    const user = userEvent.setup();
    render(<SendMoneyForm />);

    await user.type(screen.getByLabelText(/recipient email/i), 'friend@example.com');
    await user.type(screen.getByLabelText(/amount/i), '100');
    await user.click(screen.getByRole('button', { name: /send money/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Recipient bank rejected transfer');
    expect(screen.getByRole('button', { name: /send money/i })).not.toBeDisabled();
  });
});

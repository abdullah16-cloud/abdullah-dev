import React, { useState } from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { validateProfile } from '../../utils/accountValidation';
import AccountLayout from '../../components/account/AccountLayout';
import FormField from '../../components/common/FormField';

function ProfilePage() {
  usePageTitle('My Profile');
  const { user } = useAuth();

  const [formValues, setFormValues] = useState({
    fullName: user?.fullName || 'Guest Customer',
    email: user?.email || 'customer@example.com',
    phone: user?.phone || '03001234567',
    defaultCity: user?.defaultCity || user?.city || '',
    defaultAddress: user?.defaultAddress || user?.shippingAddress || '',
  });

  const [errors, setErrors] = useState({});
  const [serviceMessage, setServiceMessage] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServiceMessage(null);

    const validationErrors = validateProfile(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsUpdating(true);
    try {
      await authService.updateProfile({
        fullName: formValues.fullName.trim(),
        phone: formValues.phone.trim(),
        city: formValues.defaultCity.trim(),
        shippingAddress: formValues.defaultAddress.trim(),
      });
      setServiceMessage('Profile updated successfully.');
    } catch (err) {
      setServiceMessage(
        err?.message || 'Unable to update profile at this time. Please try again later.'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AccountLayout title="Customer Profile">
      {serviceMessage && (
        <div className="auth-honest-alert" role="alert" style={{ marginBottom: 'var(--space-6)' }}>
          {serviceMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <FormField id="profile-fullName" label="Full Name" required error={errors.fullName}>
          <input
            type="text"
            className="form-input"
            value={formValues.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
          />
        </FormField>

        <FormField
          id="profile-email"
          label="Email Address (Read-only)"
          helperText="Changing your email address requires backend verification in a later phase."
        >
          <input type="email" className="form-input" value={formValues.email} disabled />
        </FormField>

        <FormField id="profile-phone" label="Phone Number" required error={errors.phone}>
          <input
            type="tel"
            className="form-input"
            value={formValues.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </FormField>

        <FormField id="profile-city" label="Default City" error={errors.defaultCity}>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Lahore, Karachi, Rawalpindi"
            value={formValues.defaultCity}
            onChange={(e) => handleChange('defaultCity', e.target.value)}
          />
        </FormField>

        <FormField
          id="profile-address"
          label="Default Delivery Address"
          error={errors.defaultAddress}
        >
          <input
            type="text"
            className="form-input"
            placeholder="e.g. House #, Street #, Area"
            value={formValues.defaultAddress}
            onChange={(e) => handleChange('defaultAddress', e.target.value)}
          />
        </FormField>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isUpdating}
          style={{ marginTop: 'var(--space-4)' }}
        >
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </AccountLayout>
  );
}

export default ProfilePage;

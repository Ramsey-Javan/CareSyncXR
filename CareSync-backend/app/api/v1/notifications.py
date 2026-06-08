async def notify_caregiver(patient_profile, sos_event):
    # Send email/push notification (implement later)
    print(f"Notifying caregiver for patient {patient_profile.user_id} about SOS {sos_event.id}")

async def notify_next_of_kin(patient_profile, sos_event):
    print(f"Notifying next of kin for patient {patient_profile.user_id} about SOS {sos_event.id}")
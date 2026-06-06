import logging

from app.database import AsyncSessionLocal
from app.models.sos_event import SOSEvent

logger = logging.getLogger(__name__)


async def _mark_notified(sos_id, field_name: str) -> None:
    async with AsyncSessionLocal() as session:
        sos = await session.get(SOSEvent, sos_id)
        if not sos:
            logger.warning("SOS event not found for notification update: %s", sos_id)
            return
        setattr(sos, field_name, True)
        await session.commit()


async def notify_caregiver(patient_profile, sos) -> None:
    logger.info(
        "Notify caregiver for patient_id=%s sos_id=%s",
        patient_profile.id,
        sos.id,
    )
    await _mark_notified(sos.id, "notified_caregiver")


async def notify_next_of_kin(patient_profile, sos) -> None:
    logger.info(
        "Notify next of kin for patient_id=%s sos_id=%s",
        patient_profile.id,
        sos.id,
    )
    await _mark_notified(sos.id, "notified_next_of_kin")

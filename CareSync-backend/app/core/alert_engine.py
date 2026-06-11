
# Shared alert rule engine.
# Called after every health reading is flushed to DB.
# Returns a list of Alert objects ready to be added to the session.
#
# Rules:
#   BP:          systolic > 180 or diastolic > 120  → CRITICAL (hypertensive crisis)
#                systolic > 140 or diastolic > 90   → WARNING  (high BP)
#                systolic < 90  or diastolic < 60   → WARNING  (low BP)
#   Glucose:     > 200 mg/dL                        → WARNING
#                < 70  mg/dL                        → CRITICAL (hypoglycaemia)
#   O2:          < 92%                              → CRITICAL
#   Heart rate:  > 120 bpm                          → WARNING
#                < 40  bpm                          → CRITICAL
#   Temperature: > 38.5 °C                          → WARNING  (fever)
#
from app.models.alert import Alert, AlertSeverity
from app.models.health_reading import HealthReading


def evaluate_alerts(reading: HealthReading) -> list[Alert]:
    """Pure function — no DB calls. Returns Alert objects to persist."""
    alerts: list[Alert] = []

    def _alert(severity: AlertSeverity, message: str) -> Alert:
        return Alert(
            patient_id=reading.patient_id,
            reading_id=reading.id,
            severity=severity,
            message=message,
        )

    #  Blood pressure 
    if reading.systolic_bp is not None and reading.diastolic_bp is not None:
        s, d = reading.systolic_bp, reading.diastolic_bp
        if s > 180 or d > 120:
            alerts.append(_alert(AlertSeverity.CRITICAL, f"Hypertensive crisis: BP {s}/{d} mmHg"))
        elif s > 140 or d > 90:
            alerts.append(_alert(AlertSeverity.WARNING, f"High blood pressure: {s}/{d} mmHg"))
        elif s < 90 or d < 60:
            alerts.append(_alert(AlertSeverity.WARNING, f"Low blood pressure: {s}/{d} mmHg"))

    #  Glucose 
    if reading.glucose is not None:
        g = reading.glucose
        if g < 70:
            alerts.append(_alert(AlertSeverity.CRITICAL, f"Hypoglycaemia: glucose {g} mg/dL"))
        elif g > 200:
            alerts.append(_alert(AlertSeverity.WARNING, f"High glucose: {g} mg/dL"))

    # Oxygen saturation 
    if reading.oxygen_saturation is not None and reading.oxygen_saturation < 92:
        alerts.append(_alert(AlertSeverity.CRITICAL, f"Low oxygen saturation: {reading.oxygen_saturation}%"))

    # Heart rate 
    if reading.heart_rate is not None:
        hr = reading.heart_rate
        if hr < 40:
            alerts.append(_alert(AlertSeverity.CRITICAL, f"Dangerously low heart rate: {hr} bpm"))
        elif hr > 120:
            alerts.append(_alert(AlertSeverity.WARNING, f"High heart rate: {hr} bpm"))

    # Temperature 
    if reading.temperature is not None and reading.temperature > 38.5:
        alerts.append(_alert(AlertSeverity.WARNING, f"Fever: {reading.temperature} °C"))

    return alerts
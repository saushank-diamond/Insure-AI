from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute


def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


def raise_custom_exception(status_code: int, message: str, detail=None):
    return JSONResponse(
        {"error": {"message": message, "detail": detail}},
        status_code,
    )


def timestamp_diff_to_ms(start_timestamp, end_timestamp):
    """
    Calculate the difference between two timestamps and return the duration in M:S format
    """
    diff_ms = end_timestamp - start_timestamp
    seconds = diff_ms // 1000
    minutes = seconds // 60
    seconds %= 60
    return f"{minutes}:{seconds:02d}"

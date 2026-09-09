from typing import Annotated, Any

from bson import ObjectId
from pydantic import GetCoreSchemaHandler, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema


class _ObjectIdPydanticAnnotation:
    @classmethod
    def __get_pydantic_core_schema__(
        cls, _source_type: Any, _handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        def validate(value: Any) -> ObjectId:
            if isinstance(value, ObjectId):
                return value
            if isinstance(value, str) and ObjectId.is_valid(value):
                return ObjectId(value)
            raise ValueError("Invalid ObjectId")

        return core_schema.json_or_python_schema(
            json_schema=core_schema.no_info_plain_validator_function(validate),
            python_schema=core_schema.no_info_plain_validator_function(validate),
            serialization=core_schema.plain_serializer_function_ser_schema(str),
        )

    @classmethod
    def __get_pydantic_json_schema__(
        cls, _core_schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        # ObjectId has no JSON-native representation of its own - it's
        # always a 24-char hex string on the wire (see the serializer
        # above), so describe it to the OpenAPI/JSON Schema generator as
        # a plain string rather than leaving it unrepresentable.
        json_schema = handler(core_schema.str_schema())
        json_schema.update(example="507f1f77bcf86cd799439011")
        return json_schema


PyObjectId = Annotated[ObjectId, _ObjectIdPydanticAnnotation]

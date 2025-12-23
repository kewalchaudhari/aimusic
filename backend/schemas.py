from pydantic import BaseModel, Field, validator
from typing import Optional

class GenerateRequest(BaseModel):
    customMode: bool = False
    instrumental: bool = False
    prompt: Optional[str] = None
    style: Optional[str] = None
    title: Optional[str] = None
    model: str = "V5"  # Defaulting to V5, useful for length checks logic

    @validator('prompt')
    def check_prompt_length(cls, v, values):
        if not v:
            return v
        
        custom_mode = values.get('customMode', False)
        model = values.get('model', 'V5')
        
        limit = 3000 if model == 'V4' else 5000
        if not custom_mode:
            limit = 500
            
        if len(v) > limit:
            raise ValueError(f"Prompt length exceeds limit of {limit} characters")
        return v

    @validator('style')
    def check_style_length(cls, v, values):
        if not v:
            return v
        
        model = values.get('model', 'V5')
        limit = 200 if model == 'V4' else 1000
        
        if len(v) > limit:
            raise ValueError(f"Style length exceeds limit of {limit} characters")
        return v
    
    @validator('title')
    def check_title_length(cls, v, values):
        if not v:
            return v
            
        model = values.get('model', 'V5')
        limit = 80 if model == 'V4' or model == 'V4_5ALL' else 100
        
        if len(v) > limit:
            raise ValueError(f"Title length exceeds limit of {limit} characters")
        return v

    @validator('prompt', always=True)
    def validate_required_fields(cls, v, values):
        custom_mode = values.get('customMode', False)
        instrumental = values.get('instrumental', False)
        
        # If not custom mode, prompt is required
        if not custom_mode:
            if not v:
                raise ValueError("Prompt is required for non-custom mode")
            return v
        
        # If custom mode
        if custom_mode:
            # If instrumental is False, prompt is required
            if not instrumental and not v:
                raise ValueError("Prompt is required when instrumental is False in custom mode")
        
        return v

    @validator('style', always=True)
    def validate_style(cls, v, values):
        custom_mode = values.get('customMode', False)
        if custom_mode and not v:
            raise ValueError("Style is required in custom mode")
        return v

    @validator('title', always=True)
    def validate_title(cls, v, values):
        custom_mode = values.get('customMode', False)
        if custom_mode and not v:
            raise ValueError("Title is required in custom mode")
        return v

class GenerateResponse(BaseModel):
    status: str
    message: Optional[str] = None
    data: Optional[dict] = None

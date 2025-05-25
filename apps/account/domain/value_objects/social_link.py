class SocialLink:
    PROVIDER_CHOICES = ['google']

    def __init__(self, provider_name: str, social_id: str):

        if provider_name not in self.PROVIDER_CHOICES:
            raise ValueError(f"지원하지 않는 소셜 정보 제공자입니다: {provider_name}")
        if not social_id:
            raise ValueError("소셜 ID는 비어있을 수 없습니다.")
        self._provider_name = provider_name
        self._social_id = social_id
    
    @property
    def provider_name(self):
        return self._provider_name
    
    @property
    def social_id(self):
        return self._social_id
    
    def __eq__(self, other):
        return isinstance(other, SocialLink) and \
                self.provider_name == other.provider_name and \
                self.social_id == other.social_id
    
    def __hash__(self):
        return hash((self.provider_name, self.social_id))
    
    
            
        
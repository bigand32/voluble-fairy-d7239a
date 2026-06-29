const STUDIO_ITEMS = [
    {
        slug: 'a-stage',
        title: 'A STAGE',
        description: '넓고 깨끗한 공간, 부족함이 없는 편의시설, 넓은 주차공간에서는 당신이 원하는 모든 영상을 담아낼 수 있습니다.',
        image_url: 'assets/images/studio-a/exterior.png',
        layout_image_url: 'assets/images/studio-a/hall.png',
        branch: '일산',
        category: '뮤직비디오 세트',
        address: '경기도 고양시 일산동구 고봉로814번길 50-7',
        area: '약 400평',
        size_spec: 'W28,100 × L48,000 × H14,000',
        power: '400KW',
        facilities: '바톤, 대형 냉난방기 완비',
        amenities: '분장실 4개, 남녀화장실, 냉온정수기',
        sections: [
            {
                title: 'A STAGE 메인 홀',
                floor_label: '1층',
                images: [
                    'assets/images/studio-a/hall.png',
                    'assets/images/studio-a/exterior-gate.png'
                ]
            },
            {
                title: 'A-I 분장실',
                floor_label: '1층',
                images: ['assets/images/studio-a/dressing-1.png']
            },
            {
                title: 'A-II 분장실',
                floor_label: '1층',
                images: ['assets/images/studio-a/dressing-a2.png']
            },
            {
                title: '외부',
                floor_label: '',
                images: [
                    'assets/images/studio-a/exterior.png',
                    'assets/images/studio-a/exterior-gate.png'
                ]
            }
        ]
    },
    {
        slug: 'b-stage',
        title: 'B STAGE',
        description: '크로마키 및 버추얼 프로덕션에 최적화된 공간으로, 다양한 연출이 가능합니다.',
        image_url: 'assets/images/aerial-evening.png',
        layout_image_url: 'assets/images/aerial-parking.png',
        branch: '일산',
        category: '광고 세트',
        address: '경기도 고양시 일산동구 고봉로814번길 50-7',
        area: '약 350평',
        size_spec: 'W24,000 × L40,000 × H12,000',
        power: '350KW',
        facilities: '크로마키 벽면, 조명 리그 완비',
        amenities: '분장실, 화장실, 정수기, 냉장고, 와이파이',
        sections: [
            {
                title: 'B STAGE 메인 홀',
                floor_label: '1층',
                images: ['assets/images/aerial-evening.png', 'assets/images/aerial-parking.png']
            },
            {
                title: '분장실',
                floor_label: '1층',
                images: ['assets/images/aerial-abc.png', 'assets/images/aerial-night.png']
            },
            {
                title: '외부',
                floor_label: '',
                images: ['assets/images/aerial-highway.png', 'assets/images/aerial-evening.png']
            }
        ]
    },
    {
        slug: 'c-stage',
        title: 'C STAGE',
        description: '아티스트 대기실과 프리미엄 라운지가 갖춰진 중형 촬영 공간입니다.',
        image_url: 'assets/images/studio-c/exterior.png',
        layout_image_url: 'assets/images/studio-c/hall.png',
        branch: '일산',
        category: '뮤직비디오 세트',
        address: '경기도 고양시 일산동구 고봉로814번길 50-7',
        area: '약 280평',
        size_spec: 'W20,000 × L32,000 × H10,000',
        power: '300KW',
        facilities: '라운지, 소형 세트 가변 구조',
        amenities: '대기실, 샤워실, 화장실, 정수기, 와이파이',
        sections: [
            {
                title: 'C STAGE 메인 홀',
                floor_label: '1층',
                images: [
                    'assets/images/studio-c/hall.png',
                    'assets/images/studio-c/exterior-gate.png'
                ]
            },
            {
                title: '분장실',
                floor_label: '1층',
                images: [
                    'assets/images/studio-c/dressing-1.png',
                    'assets/images/studio-c/dressing-2.png'
                ]
            },
            {
                title: '외부',
                floor_label: '',
                images: [
                    'assets/images/studio-c/exterior.png',
                    'assets/images/studio-c/exterior-gate.png'
                ]
            }
        ]
    },
    {
        slug: 'art-center',
        title: 'ART CENTER',
        description: 'ART CENTER & ART HOUSE 통합 캠퍼스 전경과 복합 촬영 인프라를 한곳에서 경험하세요.',
        image_url: 'assets/images/aerial-night.png',
        layout_image_url: 'assets/images/aerial-highway.png',
        branch: '일산',
        category: '광고 세트',
        address: '경기도 고양시 일산동구 고봉로814번길 50-7',
        area: '약 500평',
        size_spec: 'W30,000 × L50,000 × H14,000',
        power: '450KW',
        facilities: '복합 촬영 인프라, 대형 냉난방기',
        amenities: '분장실/샤워실, 화장실, 정수기, 냉장고, 전자레인지, 와이파이',
        sections: [
            {
                title: '캠퍼스 전경',
                floor_label: '',
                images: ['assets/images/aerial-night.png', 'assets/images/aerial-highway.png', 'assets/images/aerial-parking.png', 'assets/images/aerial-evening.png']
            }
        ]
    }
];

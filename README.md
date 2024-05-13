# NestJS WebRTC Signaling Server

## Overview

NestJS를 기반으로 한 실시간 WebRTC 통신 시그널링 서버를 구축해보았습니다.

![WebRTC](https://remysharp.com/images/primus-scale.svg)

## Features

-   **[NestJS](https://nestjs.com/)**: 현대적인 서버 사이드 애플리케이션을 위한 프레임워크.
-   **[Socket.io](https://socket.io/)**: 실시간 양방향 이벤트 기반 통신
-   **[Redis](https://redis.io/)**: 고성능 키-값 저장소, pub/sub 패턴을 통한 메시지 브로커
-   **[WebRTC](https://webrtc.org/)**: 브라우저 간 직접적인 통신을 위한 API
-   **[PM2](https://pm2.keymetrics.io/)**: 무중단 운영과 다중 클러스터를 통한 로드밸런싱
-   **[Docker](https://www.docker.com/)**: 일관된 개발 환경을 제공하는 컨테이너화 도구

**Redis의 pub/sub 패턴**을 이용해 다중 클러스터 환경에서 단일 소켓 서버 이벤트처럼 동작하게 구성하였으며, **Let's Encrypt**를 통해 SSL/TLS 인증서를 발급받아 적용하여 HTTPS를 구현했습니다.

### CORS Policy

CORS 정책으로 인해 HTML 파일에서의 접근은 제한됩니다. 따라서 별도의 테스트 페이지용 서버와 웹소켓 게이트웨이 서버를 구성하였습니다.

## Preview

[**Explore the DEMO here!**](http://webrtc.osj-nas.synology.me/)

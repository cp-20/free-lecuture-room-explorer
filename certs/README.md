# 追加 CA 証明書

元サイトが返す証明書チェーンには `NII Open Domain CA - G7 RSA` が不足しているため、Caddy の production image ではこのディレクトリの `.crt` を OS trust store に追加します。

- `nii-open-domain-ca-g7-rsa.crt`: `kyomu0.gakumu.titech.ac.jp` の leaf 証明書 issuer。
- `secom-security-communication-rootca2.crt`: G7 中間 CA の issuer。

Dockerfile は不足している中間 CA の `.crt` を OS trust store にコピーしたあと `update-ca-certificates` を実行します。Caddy の `tls_trust_pool file` 用に、このディレクトリ全体も `/srv/certs/` へコピーします。

# Scripts de despliegue

En esta entrega se utilizó Remix como herramienta principal de desarrollo, compilación, testing y despliegue del contrato.

Por este motivo, no se incluye un script automatizado de despliegue con Hardhat o Foundry. El despliegue se realiza manualmente desde Remix, lo cual corresponde al toolchain utilizado en el curso.

## Despliegue desde Remix

1. Abrir Remix.
2. Compilar el archivo:

```text
contracts/Multisig.sol
```

3. Ir a la pestaña **Deploy & Run Transactions**.

4. Seleccionar el ambiente deseado:

   * `Remix VM` para pruebas locales.
   * `Injected Provider - MetaMask` para desplegar en Sepolia.

5. Completar los parámetros del constructor:

```text
initialSigners:
["0xSigner1","0xSigner2","0xSigner3"]

initialThreshold:
2
```

6. Presionar **Deploy**.

## Parámetros del constructor

El contrato recibe:

```solidity
constructor(address[] memory initialSigners, uint256 initialThreshold)
```

Donde:

* `initialSigners` es la lista de direcciones autorizadas para proponer, aprobar, ejecutar y cancelar propuestas.
* `initialThreshold` es la cantidad mínima de aprobaciones necesarias para ejecutar una propuesta.

## Ejemplo

```text
initialSigners:
["0x1111111111111111111111111111111111111111","0x2222222222222222222222222222222222222222","0x3333333333333333333333333333333333333333"]

initialThreshold:
2
```

En este ejemplo, existen tres signers y se necesitan dos aprobaciones para ejecutar una propuesta.

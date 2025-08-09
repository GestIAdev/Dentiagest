def suma_joker(a, b):
    """
    🃏 Una suma que no es para nada ordinaria...
    
    ¿Por qué conformarse con una suma aburrida cuando puedes tener
    una función que suma CON ESTILO? 
    
    Args:
        a: El primer número (esperemos que sea digno)
        b: El segundo número (que mejor coopere)
    
    Returns:
        El resultado de la suma más épica que hayas visto
        
    Raises:
        TypeError: Si alguien se atreve a pasar algo que no sea número
    """
    
    # Validación con actitud 😎
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise TypeError("¡Oye! Solo acepto números, no me vengas con strings o cosas raras 🎭")
    
    resultado = a + b
    
    # Un poco de drama porque... ¿por qué no?
    if resultado == 0:
        print("🎪 ¡Vaya! El universo se equilibra perfectamente... resultado: 0")
    elif resultado < 0:
        print(f"🃏 Mmm, territorio negativo... ¡Me gusta lo oscuro! Resultado: {resultado}")
    elif resultado > 1000:
        print(f"🚀 ¡BOOM! Ese número es ÉPICO: {resultado}")
    else:
        print(f"🎯 Cálculo completado con éxito: {resultado}")
    
    return resultado


def test_suma_joker():
    """
    🧪 Porque incluso el Joker necesita probar que sus travesuras funcionan
    """
    print("=" * 50)
    print("🎭 INICIANDO PRUEBAS DE LA SUMA JOKER 🎭")
    print("=" * 50)
    
    # Test casos normales
    assert suma_joker(2, 3) == 5
    assert suma_joker(-1, 1) == 0
    assert suma_joker(500, 600) == 1100
    
    # Test casos decimales
    assert suma_joker(2.5, 3.7) == 6.2
    
    print("\n✅ ¡Todas las pruebas pasaron! La suma joker está lista para dominar el mundo 🌍")
    
    # Un poco de diversión extra
    try:
        suma_joker("hola", "mundo")
    except TypeError as e:
        print(f"\n🎪 Error capturado correctamente: {e}")


if __name__ == "__main__":
    print("🃏 ¡Bienvenido al show de la suma más épica del universo! 🃏")
    print("-" * 60)
    
    # Ejecutar pruebas
    test_suma_joker()
    
    print("\n" + "=" * 60)
    print("🎭 ¡DEMO INTERACTIVO! 🎭")
    print("=" * 60)
    
    # Demo interactivo
    ejemplos = [
        (42, 24),
        (100, 200),
        (-50, 75),
        (3.14, 2.86),
        (999, 2)
    ]
    
    for a, b in ejemplos:
        print(f"\n🎲 Sumando {a} + {b}:")
        suma_joker(a, b)
    
    print(f"\n🃏 ¡Eso es todo por hoy! El show ha terminado... o ¿acaso apenas comienza? 😈")